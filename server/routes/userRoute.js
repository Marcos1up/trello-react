const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();

//POST /user
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/get-user-with-email", userController.getUserWithMail);

//GET /user
router.get("/get-user", userController.getUser);

module.exports = router;
