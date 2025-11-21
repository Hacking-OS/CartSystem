const express = require("express");
const router = express.Router();

router.get("/check", (req, res) => {
  return res.status(200).json({
    ok: true,
    message: "System reachable.",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;

