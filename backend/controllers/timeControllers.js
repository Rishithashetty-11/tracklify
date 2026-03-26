const TimeLog = require("..models/TimeLog");

exports.addTime = async (req, res) => {
  const { projectId, startTime, endTime } = req.body;

  const duration =
    (new Date(endTime) - new Date(startTime)) / 1000;

  const log = await TimeLog.create({
    projectId,
    startTime,
    endTime,
    duration
  });

  res.json(log);
};

exports.getTimeLogs = async (req, res) => {
  const logs = await TimeLog.find({
    projectId: req.params.projectId
  });

  res.json(logs);
};