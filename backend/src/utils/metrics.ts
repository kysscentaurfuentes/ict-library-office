// ICT-LIBRARY-OFFICE/backend/src/utils/metrics.ts

import client from "prom-client";

export const scanEventsTotal =
  new client.Counter({
    name: "ict_scan_events_total",
    help: "Total scan events",
  });

export const attendanceEventsTotal =
  new client.Counter({
    name: "ict_attendance_events_total",
    help: "Total attendance events",
  });

export const authEventsTotal =
  new client.Counter({
    name: "ict_auth_events_total",
    help: "Total auth events",
  });

export const networkEventsTotal =
  new client.Counter({
    name: "ict_network_events_total",
    help: "Total network events",
  });

export const streamingEventsTotal =
  new client.Counter({
    name: "ict_streaming_events_total",
    help: "Total streaming events",
  });

export const socketEventsTotal =
  new client.Counter({
    name: "ict_socket_events_total",
    help: "Total socket events",
  });

export const uploadEventsTotal =
  new client.Counter({
    name: "ict_upload_events_total",
    help: "Total upload events",
  });

export const graphqlEventsTotal =
  new client.Counter({
    name: "ict_graphql_events_total",
    help: "Total graphql events",
  });

export const errorEventsTotal =
  new client.Counter({
    name: "ict_error_events_total",
    help: "Total error events",
  });