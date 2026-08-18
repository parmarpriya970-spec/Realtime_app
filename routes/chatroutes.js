const express = require("express");
const router = express.Router();
const { showChat, sendMessage } = require("../controllers/chatcontroller");
const { showGroup, createGroup, acceptGroup, rejectGroup, sendGroupMessage } = require("../controllers/groupcontroller");
const { isLoggedIn } = require("../middleware/friend");

router.get("/chat/:user_id", isLoggedIn, showChat);
router.post("/sendmessage", isLoggedIn, sendMessage);

router.get("/groupchat", isLoggedIn, showGroup);
router.get("/groupchat/:group_id", isLoggedIn, showGroup);
router.post("/creategroup", isLoggedIn, createGroup);
router.post("/acceptgroup", isLoggedIn, acceptGroup);
router.post("/rejectgroup", isLoggedIn, rejectGroup);
router.post("/sendgroupmessage", isLoggedIn, sendGroupMessage);




module.exports = router;
