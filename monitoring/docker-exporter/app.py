# ICT-LIBRARY-OFFICE/monitoring/docker-exporter/app.py

from flask import Flask, Response
from prometheus_client import Gauge, generate_latest
import docker
import threading
import time
import json
import re
import requests
from datetime import datetime

app = Flask(__name__)

client = docker.from_env()

LATEST_VERSIONS = {}

LATEST_TAGS = {}

TAG_COUNTS = {}

DOCKERHUB_IMAGES = {

    "ict-grafana":
        "grafana/grafana-oss",

    "ict-prometheus":
        "prom/prometheus",

    "ict-loki":
        "grafana/loki",

    "ict-promtail":
        "grafana/promtail",

    "ict-node-exporter":
        "prom/node-exporter",

    "ict-blackbox-exporter":
        "prom/blackbox-exporter",

    "ict-snmp-exporter":
        "prom/snmp-exporter",

    "ict-cadvisor":
        "google/cadvisor",

    "ict-collectd-exporter":
        "prom/collectd-exporter",

    "ict-postgres-dev":
        "library/postgres",

    "ict-redis-dev":
        "library/redis",

    "ict-nginx-dev":
        "library/nginx",

}

RUNTIME_VERSION_COMMANDS = {

    "ict-grafana": [
        "grafana",
        "cli",
        "-v"
    ],

    "ict-prometheus": [
        "prometheus",
        "--version"
    ],

    "ict-promtail": [
        "/usr/bin/promtail",
        "--version"
    ],

    "ict-loki": [
        "/usr/bin/loki",
        "-version"
    ],

    "ict-mediamtx-dev": [
        "/mediamtx",
        "--version"
    ],

    "ict-redis-dev": [
        "redis-server",
        "--version"
    ],

    "ict-postgres-dev": [
        "postgres",
        "--version"
    ],

    "ict-nginx-dev": [
        "nginx",
        "-v"
    ],

    "ict-node-exporter": [
        "node_exporter",
        "--version"
    ],

    "ict-blackbox-exporter": [
        "/bin/blackbox_exporter",
        "--version"
    ],

    "ict-snmp-exporter": [
        "/bin/snmp_exporter",
        "--version"
    ],

    "ict-cadvisor": [
        "/usr/bin/cadvisor",
        "--version"
    ],

    "ict-collectd-exporter": [
        "collectd_exporter",
        "--version"
    ],

    "ict-ai-service-dev": [
        "python",
        "--version"
    ]
}

# =========================================================
# METRICS
# =========================================================

container_pids = Gauge(
    "container_pids",
    "Container PIDS count",
    ["container_name"]
)

container_running = Gauge(
    "container_running",
    "Container running state",
    ["container_name"]
)

container_health_status = Gauge(
    "container_health_status",
    "Container health status (1=healthy, 0=unhealthy)",
    ["container_name"]
)

container_restarts = Gauge(
    "container_restart_count",
    "Container restart count",
    ["container_name"]
)

container_info = Gauge(
    "container_info",
    "Container image information",
    [
        "container_name",
        "image",
        "version"
    ]
)

container_runtime_info = Gauge(
    "container_runtime_info",
    "Container runtime version",
    [
        "container_name",
        "runtime_version"
    ]
)

container_latest_version_info = Gauge(
    "container_latest_version_info",
    "Latest available version",
    [
        "container_name",
        "latest_version"
    ]
)

container_latest_tag_info = Gauge(
    "container_latest_tag_info",
    "Latest raw docker hub tag",
    [
        "container_name",
        "latest_tag"
    ]
)

container_tag_count = Gauge(
    "container_tag_count",
    "Total docker hub tags",
    [
        "container_name"
    ]
)

container_days_behind = Gauge(
    "container_days_behind",
    "Container days behind latest release",
    [
        "container_name"
    ]
)

exporter_last_update = Gauge(
    "docker_exporter_last_update_timestamp",
    "Last successful docker metrics update"
)

exporter_update_duration = Gauge(
    "docker_exporter_update_duration_seconds",
    "Docker metrics collection duration"
)

container_update_status = Gauge(
    "container_update_status",
    "Container update status",
    [
        "container_name",
        "status"
    ]
)

container_started_timestamp = Gauge(
    "container_started_timestamp",
    "Container started timestamp",
    ["container_name"]
)

container_created_timestamp = Gauge(
    "container_created_timestamp",
    "Container created timestamp",
    ["container_name"]
)

container_uptime_seconds = Gauge(
    "container_uptime_seconds",
    "Container uptime in seconds",
    ["container_name"]
)

# =========================================================
# UPDATE METRICS
# =========================================================
def get_runtime_version(container):

    try:

        # ==========================================
        # BACKEND PACKAGE.JSON
        # ==========================================

        if container.name == "ict-backend-dev":

            result = container.exec_run(
                "cat package.json"
            )

            package = json.loads(
                result.output.decode()
            )

            return package.get(
                "version",
                "unknown"
            )

        # ==========================================
        # FRONTEND PACKAGE.JSON
        # ==========================================

        if container.name == "ict-frontend-dev":

            result = container.exec_run(
                "cat /app/package.json"
            )

            package = json.loads(
                result.output.decode()
            )

            return package.get(
                "version",
                "unknown"
            )
        
        # ==========================================
        # DOCKER EXPORTER LABEL VERSION
        # ==========================================

        if container.name == "ict-docker-exporter":

            labels = (
                container.image.attrs
                .get("Config", {})
                .get("Labels", {})
            )

            return labels.get(
                "app.version",
                "unknown"
            )

        # ==========================================
        # STANDARD COMMANDS
        # ==========================================

        command = RUNTIME_VERSION_COMMANDS.get(
            container.name
        )

        if not command:

            return "unknown"

        result = container.exec_run(
            command,
            stderr=True,
            stdout=True
        )

        output = result.output.decode(
            "utf-8",
            errors="ignore"
        )

        if not output:

            return "unknown"

        text = output.splitlines()[0].strip()

        # ==========================================
        # GRAFANA
        # ==========================================

        if container.name == "ict-grafana":

            return text.replace(
                "grafana version ",
                ""
            )

        # ==========================================
        # PROMETHEUS
        # ==========================================

        if container.name == "ict-prometheus":

            match = re.search(
                r"version\s+([\d\.]+)",
                text
            )

            return match.group(1) if match else "unknown"

        # ==========================================
        # PROMTAIL
        # ==========================================

        if container.name == "ict-promtail":

            match = re.search(
                r"version\s+([\d\.]+)",
                text
            )

            return match.group(1) if match else "unknown"

        # ==========================================
        # LOKI
        # ==========================================

        if container.name == "ict-loki":

            match = re.search(
                r"version\s+([\d\.]+)",
                text
            )

            return match.group(1) if match else "unknown"

        # ==========================================
        # MEDIAMTX
        # ==========================================

        if container.name == "ict-mediamtx-dev":

            return text.replace(
                "v",
                ""
            )

        # ==========================================
        # REDIS
        # ==========================================

        if container.name == "ict-redis-dev":

            match = re.search(
                r"v=([\d\.]+)",
                text
            )

            return match.group(1) if match else "unknown"

        # ==========================================
        # POSTGRES
        # ==========================================

        if container.name == "ict-postgres-dev":

            match = re.search(
                r"PostgreSQL\)\s+([\d\.]+)",
                text
            )

            return match.group(1) if match else "unknown"

        # ==========================================
        # NGINX
        # ==========================================

        if container.name == "ict-nginx-dev":

            match = re.search(
                r"nginx\/([\d\.]+)",
                text
            )

            return match.group(1) if match else "unknown"

        # ==========================================
        # NODE EXPORTER
        # ==========================================

        if container.name == "ict-node-exporter":

            match = re.search(
                r"version\s+([\d\.]+)",
                text
            )

            return match.group(1) if match else "unknown"

        # ==========================================
        # BLACKBOX EXPORTER
        # ==========================================

        if container.name == "ict-blackbox-exporter":

            match = re.search(
                r"version\s+([\d\.]+)",
                text
            )

            return match.group(1) if match else "unknown"

        # ==========================================
        # SNMP EXPORTER
        # ==========================================

        if container.name == "ict-snmp-exporter":

            match = re.search(
                r"version\s+([\d\.]+)",
                text
            )

            return match.group(1) if match else "unknown"

        # ==========================================
        # CADVISOR
        # ==========================================

        if container.name == "ict-cadvisor":

            match = re.search(
                r"v([\d\.]+)",
                text
            )

            return match.group(1) if match else "unknown"
        
        # ==========================================
        # COLLECTD EXPORTER
        # ==========================================

        if container.name == "ict-collectd-exporter":

            match = re.search(
                r"version\s+([\d\.]+)",
                text
            )

            return match.group(1) if match else "unknown"

        # ==========================================
        # AI SERVICE
        # ==========================================

        if container.name == "ict-ai-service-dev":

            match = re.search(
                r"Python\s+([\d\.]+)",
                text
            )

            return match.group(1) if match else "unknown"

        return text

    except Exception as e:

        print(
            f"RUNTIME VERSION ERROR [{container.name}] => {e}"
        )

        return "unknown"
    

# =========================================================
# DOCKER HUB VERSION CHECKER
# =========================================================

def get_latest_version_from_dockerhub(
    image_name
):
    


    try:

        url = (
            f"https://hub.docker.com/v2/repositories/"
            f"{image_name}/tags?page_size=100"
        )

        response = requests.get(
            url,
            timeout=10
        )

        if response.status_code != 200:

            return None

        data = response.json()

        results = data.get(
            "results",
            []
        )

        if not results:

            return None

        print(
            image_name,
            [x["name"] for x in results[:20]]
        )
        
        latest_tag = "unknown"

        version_tags = []

        special_tags = []

        for tag in results:

            name = tag.get(
                "name",
                ""
            )

            if re.match(
                r"^\d+(\.\d+)*$",
                name
            ):
                version_tags.append(name)

            else:
                special_tags.append(name)

        print(
            image_name,
            special_tags[:20]
        )

        for tag in special_tags:

            if tag not in [
                "latest",
                "stable",
                "main",
                "master"
            ]:
                latest_tag = tag
                break

        if latest_tag == "unknown" and special_tags:
            latest_tag = special_tags[0]

        latest_version = "unknown"

        if version_tags:

            version_tags.sort(
                key=lambda s: [
                    int(x)
                    for x in s.split(".")
                ],
                reverse=True
            )

            latest_version = (
                version_tags[0]
            )


        return {
            "latest_version":
                latest_version,
            "latest_tag":
                latest_tag,
            "tag_count":
                len(results)
        }

    except Exception as e:

        print(
            f"DOCKER HUB ERROR [{image_name}] => {e}"
        )

        return None
    

# =========================================================
# UPDATE CACHE
# =========================================================

def refresh_latest_versions():

    while True:

        try:

            print(
                "Refreshing latest Docker Hub versions..."
            )

            for container_name, image_name in (
                DOCKERHUB_IMAGES.items()
            ):

                info = (
                    get_latest_version_from_dockerhub(
                        image_name
                    )
                )

                if info:

                    LATEST_VERSIONS[
                        container_name
                    ] = info["latest_version"]

                    LATEST_TAGS[
                        container_name
                    ] = info["latest_tag"]

                    TAG_COUNTS[
                        container_name
                    ] = info["tag_count"]

                    print(
                        f"{container_name}"
                        f" => "
                        f"{info['latest_version']}"
                    )
                    print(
                        f"{container_name}"
                        f" => "
                        f"{info['latest_tag']}"
                    )


            print(
                "Docker Hub refresh complete."
            )

        except Exception as e:

            print(
                f"VERSION CACHE ERROR => {e}"
            )

        time.sleep(
            60
        )
    


def update_metrics():

    #container_update_status.clear()
    #container_latest_version_info.clear()
    #container_latest_tag_info.clear()
    #container_days_behind.clear()
    #container_runtime_info.clear()
    #container_info.clear()

    start = time.time()

    containers = client.containers.list(all=True)

    for container in containers:

        try:

            name = container.name

            attrs = container.attrs

            state = attrs.get(
                "State",
                {}
            )

            started_at = state.get(
                "StartedAt"
            )

            created_at = attrs.get(
                "Created"
            )

            if started_at:

                try:

                    started_ts = (
                        datetime
                        .fromisoformat(
                            started_at.replace(
                                "Z",
                                "+00:00"
                            )
                        )
                        .timestamp()
                    )

                    container_started_timestamp.labels(
                        container_name=name
                    ).set(started_ts)

                    uptime_seconds = int(
                        time.time() - started_ts
                    )

                    days = uptime_seconds // 86400
                    hours = (uptime_seconds % 86400) // 3600
                    minutes = (uptime_seconds % 3600) // 60
                    seconds = uptime_seconds % 60

                    parts = []

                    if days:
                        parts.append(f"{days}d")

                    if hours:
                        parts.append(f"{hours}h")

                    if minutes:
                        parts.append(f"{minutes}m")

                    parts.append(f"{seconds}s")

                    uptime_text = " ".join(parts)

                    container_uptime_seconds.labels(
                        container_name=name
                    ).set(uptime_seconds)

                except Exception as e:

                    print(
                        f"STARTED TIMESTAMP ERROR [{name}] => {e}"
                    )

            if created_at:

                try:

                    created_ts = (
                        datetime
                        .fromisoformat(
                            created_at.replace(
                                "Z",
                                "+00:00"
                            )
                        )
                        .timestamp()
                    )

                    container_created_timestamp.labels(
                        container_name=name
                    ).set(created_ts)

                except Exception as e:

                    print(
                        f"CREATED TIMESTAMP ERROR [{name}] => {e}"
                    )
                

            state = attrs.get(
                "State",
                {}
            )

            stats = container.stats(
                stream=False
            )

            pids_count = (
                stats
                .get("pids_stats", {})
                .get("current")
            )

            if pids_count is None:

                try:

                    top = container.top()

                    pids_count = len(
                        top.get(
                            "Processes",
                            []
                        )
                    )

                except Exception:

                    pids_count = 0

            running = (
                1
                if state.get(
                    "Running",
                    False
                )
                else 0
            )

            health = state.get(
                "Health",
                {}
            )

            health_status = (
                1
                if health.get("Status") == "healthy"
                else 0
            )

            restart_count = attrs.get(
                "RestartCount",
                0
            )

            image_tag = ""

            try:

                image_tags = attrs.get(
                    "Config",
                    {}
                ).get(
                    "Image",
                    ""
                )

                image_tag = image_tags

            except Exception:

                image_tag = "unknown"


            if ":" in image_tag:

                image_name, image_version = image_tag.rsplit(
                    ":",
                    1
                )

            else:

                image_name = image_tag
                image_version = "latest"

            container_pids.labels(
                container_name=name
            ).set(pids_count)

            container_running.labels(
                container_name=name
            ).set(running)

            container_health_status.labels(
                container_name=name
            ).set(health_status)

            container_restarts.labels(
                container_name=name
            ).set(restart_count)

            container_info.labels(
                container_name=name,
                image=image_name,
                version=image_version
            ).set(1)

            runtime_version = get_runtime_version(
                container
            )

            latest_version = (
                LATEST_VERSIONS.get(name)
                or runtime_version
            )

            latest_tag = LATEST_TAGS.get(
                name,
                "unknown"
            )

            tag_count = TAG_COUNTS.get(
                name,
                0
            )

            if runtime_version == latest_version:

                update_status = "Up-to-date"

            else:

                update_status = "Outdated"

            container_update_status.labels(
                container_name=name,
                status=update_status
            ).set(1)

            container_latest_version_info.labels(
                container_name=name,
                latest_version=latest_version
            ).set(1)

            container_latest_tag_info.labels(
                container_name=name,
                latest_tag=latest_tag
            ).set(1)

            container_tag_count.labels(
                container_name=name
            ).set(tag_count)

            days_behind = 0

            if update_status == "Outdated":

                version_gap = abs(
                    len(str(latest_version))
                    - len(str(runtime_version))
                )

                days_behind = max(
                    1,
                    version_gap * 5
                )

            container_days_behind.labels(
                container_name=name
            ).set(days_behind)

            container_runtime_info.labels(
                container_name=name,
                runtime_version=runtime_version
            ).set(1)

        except Exception as e:

            print(
                f"ERROR [{container.name}] => {e}"
            )

    exporter_last_update.set(
        time.time()
    )

    exporter_update_duration.set(
        time.time() - start
    )


# =========================================================
# BACKGROUND COLLECTOR
# =========================================================

def collector_loop():

    while True:

        try:

            update_metrics()

        except Exception as e:

            print(
                f"COLLECTOR ERROR => {e}"
            )

        time.sleep(30)


threading.Thread(
    target=collector_loop,
    daemon=True
).start()

threading.Thread(
    target=refresh_latest_versions,
    daemon=True
).start()


# =========================================================
# ROUTES
# =========================================================

@app.route("/metrics")
def metrics():

    return Response(
        generate_latest(),
        mimetype="text/plain"
    )


@app.route("/health")
def health():

    return {
        "status": "ok"
    }


# =========================================================
# START
# =========================================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=8000
    )