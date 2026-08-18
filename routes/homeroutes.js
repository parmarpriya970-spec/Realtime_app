const express = require("express");
const router = express.Router();
const { showhome, addFriend, updatefriend, showInvitations, myInvitations, rejectfriend } = require("../controllers/homecontroller");
const { isLoggedIn } = require("../middleware/friend");
const { upload, uploadProfile, updateProfile, showProfile, showGroupProfile, uploadGroupProfile, updateGroupProfile } = require("../controllers/profilecontroller");

router.get("/home", isLoggedIn, showhome);
router.post("/addfriend", isLoggedIn, addFriend);
router.post("/updatefriend", isLoggedIn, updatefriend);
router.get("/invitation", isLoggedIn, showInvitations);
router.get("/myInvitation", isLoggedIn, myInvitations);
router.post("/rejectfriend", isLoggedIn, rejectfriend);
router.post("/uploadprofile", isLoggedIn, upload.single("profile_photo"), uploadProfile);
router.post("/updateprofile", isLoggedIn, updateProfile);
router.get("/profile", isLoggedIn, showProfile);
router.get("/groupprofile/:group_id", isLoggedIn, showGroupProfile);
router.post("/uploadgroupprofile", isLoggedIn, upload.single("profile_photo"), uploadGroupProfile);
router.post("/updategroupprofile", isLoggedIn, updateGroupProfile);

module.exports = router;