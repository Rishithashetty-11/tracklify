const router = require("express").Router();
const notificationController = require("../controllers/notificationController");
const auth = require("../middleware/auth");

router.get("/notifications", auth, notificationController.getNotifications);
router.patch("/notifications/:id/read", auth, notificationController.markAsRead);

module.exports = router;
