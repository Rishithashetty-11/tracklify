const router = require("express").Router();
const TimeLog = require("../models/timeLog");

router.post("/time", async (req, res) => {
  try {
    const { projectId, startTime, endTime } = req.body;
    const duration = (new Date(endTime) - new Date(startTime)) / 1000;

    const log = await TimeLog.create({ projectId, startTime, endTime, duration });
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: "Error saving time log", error: err.message });
  }
});

router.get("/time/:projectId", async (req, res) => {
  try {
    const logs = await TimeLog.find({ projectId: req.params.projectId });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching time logs", error: err.message });
  }
});

module.exports = router;