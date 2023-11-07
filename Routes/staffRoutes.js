const express = require("express");
const router = express.Router();
const staffController = require("../Controllers/staffController");
router.post("/register", staffController.Register);
router.post("/login", staffController.login);
router.get("/staffsNotApprouved", staffController.staffsNotApprouved);
router.put("/approuvingStaff/:id", staffController.approuvingStaff);
module.exports = router;
