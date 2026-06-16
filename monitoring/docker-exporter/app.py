# ICT-LIBRARY-OFFICE/monitoring/docker-exporter/app.py

from flask import Flask, Response
from prometheus_client import Gauge, generate_latest
import docker
import time

app = Flask(__name__)

client = docker.from_env()

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

container_restarts = Gauge(
    "container_restart_count",
    "Container restart count",
    ["container_name"]
)


def update_metrics():
    containers = client.containers.list(all=True)

    for container in containers:

        try:
            container.reload()

            name = container.name

            attrs = container.attrs

            state = attrs.get("State", {})

            stats = container.stats(
                stream=False
            )

            pids_count = (
                stats
                .get("pids_stats", {})
                .get("current")
            )

            if pids_count is None:

                top = container.top()

                pids_count = len(
                    top.get("Processes", [])
                )

            if name == "ict-ai-service-dev":
                print(
                    f"[DEBUG] {name} pids_stats={stats.get('pids_stats', {})}"
                )

            running = (
                1 if state.get(
                    "Running",
                    False
                ) else 0
            )

            restart_count = attrs.get(
                "RestartCount",
                0
            )

            container_pids.labels(
                container_name=name
            ).set(pids_count)

            container_running.labels(
                container_name=name
            ).set(running)

            container_restarts.labels(
                container_name=name
            ).set(restart_count)

        except Exception as e:
            print(
                f"ERROR [{container.name}] => {e}"
            )


@app.route("/metrics")
def metrics():

    update_metrics()

    return Response(
        generate_latest(),
        mimetype="text/plain"
    )


@app.route("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=8000
    )