// backend/src/routes/network.routes.ts

import { Router } from "express";
import { deviceStatuses } from "../network/deviceState.js";

const router = Router();

router.get("/devices", (_req, res) => {
  const devices = Array.from(deviceStatuses.values());

  res.json(devices);
});

export default router;