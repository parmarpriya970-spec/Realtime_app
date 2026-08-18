const express = require("express");
const router = express.Router();

const { showlogin, showRegister, login, register, logout, showforget, forget, showNewpin, newpin } = require("../controllers/authcontroller");

router.get("/login", showlogin);
router.post("/login", login);
router.get("/register", showRegister);
router.post("/register", register);
router.get("/logout", logout);
router.get("/forget", showforget);
router.post("/forget", forget);
router.get("/newPIN", showNewpin);
router.post("/newPIN", newpin);

module.exports = router;