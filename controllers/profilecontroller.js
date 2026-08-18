const { db } = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const profileDir = path.join(__dirname, "../public/profile");

if (!fs.existsSync(profileDir)) {
    fs.mkdirSync(profileDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, profileDir);
    },

    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    }
});

const upload = multer({
    storage: storage
});


function showProfile(req, res) {
    const user_id = req.session.user_id;

    db.query("SELECT * FROM user WHERE user_id = ?", [user_id], (err, profileResult) => {
        if (err) {
            return res.redirect("/home?message=" + encodeURIComponent("Error showing profile"));
        }
        res.render("profile", { user: profileResult[0]});
    });
}
function uploadProfile(req, res) {
    const user_id = req.session.user_id;
const profile_photo = req.file.filename;
db.query("UPDATE user SET profile_photo = ? WHERE user_id = ?", [profile_photo, user_id], (err, profile) => {
    if (err) {
        console.log(err);
        return res.redirect("/home?message=" + encodeURIComponent("Error uploading profile"));
    }
    return res.redirect("/profile?message=" + encodeURIComponent("Profile uploaded successfully"));
});
}

function updateProfile(req, res) {
    const user_id = req.session.user_id;
    const name = req.body.name;
  
    db.query("UPDATE user SET name = ? WHERE user_id = ?", [name, user_id], (err,name) => {
        if (err) {
            console.log(err);
            return res.redirect("/profile?message=" + encodeURIComponent("Error updating profile"));
        }
        return res.redirect("/profile?message=" + encodeURIComponent("Profile updated successfully"));
    });
}

function showGroupProfile(req, res) {
    const group_id = req.params.group_id;

    db.query("SELECT * FROM `group` WHERE group_id = ?", [group_id], (err, groupResult) => {
        if (err) {
            return res.redirect("/home?message=" + encodeURIComponent("Error showing group profile"));
        }

        db.query(
            "SELECT user.user_id, user.name, user.profile_photo, group_member.role FROM group_member JOIN user ON group_member.user_id = user.user_id WHERE group_member.group_id = ? AND group_member.status = 1",
            [group_id],
            (memberErr, members) => {
                if (memberErr) {
                    return res.redirect("/home?message=" + encodeURIComponent("Error showing group profile"));
                }
                res.render("groupprofile", { group: groupResult[0], group_id: group_id, members: members });
            }
        );
    });
}

function uploadGroupProfile(req, res) {
    const group_id = req.body.group_id;
    const group_profile = req.file.filename;
    db.query("UPDATE `group` SET group_profile = ? WHERE group_id = ?", [group_profile, group_id], (err, profile) => {
        if (err) {
            console.log(err);
            return res.redirect("/home?message=" + encodeURIComponent("Error uploading group profile"));
        }
        return res.redirect("/groupprofile/" + group_id + "?message=" + encodeURIComponent("Group profile uploaded successfully"));
    });
}

function updateGroupProfile(req, res) {
    const group_id = req.body.group_id;
    const group_name = req.body.group_name;

    db.query("UPDATE `group` SET group_name = ? WHERE group_id = ?", [group_name, group_id], (err, name) => {
        if (err) {
            console.log(err);
            return res.redirect("/groupprofile/" + group_id + "?message=" + encodeURIComponent("Error updating group profile"));
        }
        return res.redirect("/groupprofile/" + group_id + "?message=" + encodeURIComponent("Group profile updated successfully"));
    });
}

module.exports = {
    upload ,
    uploadProfile,
    updateProfile,
    showProfile,
    showGroupProfile,
    uploadGroupProfile,
    updateGroupProfile
};