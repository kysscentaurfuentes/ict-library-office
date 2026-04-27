"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_js_1 = require("../db.js");
const crypto_1 = __importDefault(require("crypto"));
const router = (0, express_1.Router)();
router.post('/share', async (req, res) => {
    try {
        const studentId = req.body?.studentId;
        if (!studentId) {
            return res.status(400).json({ message: 'Missing studentId' });
        }
        const token = crypto_1.default.randomBytes(24).toString("hex");
        await db_js_1.pool.query("INSERT INTO share_tokens (token, student_id) VALUES ($1, $2)", [token, studentId]);
        return res.json({ token });
    }
    catch (error) {
        console.error('Share error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=shareRoutes.js.map