const { db } = require("../db");

function showGroup(req, res) {
    const group_id = req.params.group_id;

    if (!group_id) {
        return res.render("groupchat");
    }

    db.query(
        "SELECT user.user_id, user.name, user.profile_photo, group_member.role FROM group_member JOIN user ON group_member.user_id = user.user_id WHERE group_member.group_id = ? AND group_member.status = 1",
        [group_id],
        (err, members) => {
            if (err) {
                console.log(err);
                return res.redirect("/groupchat?message=" + encodeURIComponent("Error loading members"));
            }
    db.query(
        "SELECT messages.*, user.name AS sender_name FROM messages JOIN user ON messages.user_id = user.user_id WHERE group_id = ?",
        [group_id],
        (err, messages) => {
            if (err) {
                console.log(err);
                return res.redirect("/groupchat?message=" + encodeURIComponent("Error loading messages"));
            }

           console.log(members);
            res.render("groupchat", {
                group_id,
                messages,
                members
            });
        }
    );
});
}

function createGroup(req, res) {
    const user_id = req.session.user_id;
    const member_id = [].concat(req.body.friend_id || []);

    if (req.body.group_name === "") {
        return res.redirect("/groupchat?message=" + encodeURIComponent("Group name is required"));
    }

    db.query(
        "INSERT INTO `group` (group_name, created_by) VALUES (?, ?)",
        [req.body.group_name, user_id],
        (err, results) => {
            if (err) {
                console.log(err);
                return res.redirect("/groupchat?message=" + encodeURIComponent("Error creating group"));
            }

            const group_id = results.insertId;

            db.query(
                "INSERT INTO group_member (group_id, user_id, role, status) VALUES (?, ?, ?, ?)",
                [group_id, user_id, 1, 1],
                (err1) => {
                    if (err1) {
                        console.log(err1);
                        return res.redirect("/groupchat?message=" + encodeURIComponent("Error adding member to group"));
                    }

                    if (member_id.length === 0) {
                        return res.redirect("/groupchat?message=" + encodeURIComponent("Group created successfully"));
                    }

                    let complete = 0;

                    member_id.forEach((friend_id) => {
                        db.query(
                            "INSERT INTO group_member (group_id, user_id, role, status, invited_by) VALUES (?, ?, ?, ?, ?)",
                            [group_id, friend_id, 0, 0, user_id],
                            (err2) => {
                                if (err2) {
                                    console.log(err2);
                                    return res.redirect("/groupchat?message=" + encodeURIComponent("Error adding member to group"));
                                }

                                complete++;
                                if (complete === member_id.length) {
                                    return res.redirect("/groupchat?message=" + encodeURIComponent("Group created successfully"));
                                }
                            }
                        );
                    });
                }
            );
        }
    );
}

function acceptGroup(req, res) {
    const user_id = req.session.user_id;

    db.query(
        "UPDATE group_member SET status = 1 WHERE group_id = ? AND user_id = ?",
        [req.body.group_id, user_id],
        (err) => {
            if (err) {
                return res.redirect("/invitation?message=" + encodeURIComponent("Error accepting group"));
            }
            return res.redirect("/invitation?message=" + encodeURIComponent("Group invitation accepted"));
        }
    );
}

function rejectGroup(req, res) {
    const user_id = req.session.user_id;

    db.query(
        "DELETE FROM group_member WHERE group_id = ? AND user_id = ?",
        [req.body.group_id, user_id],
        (err) => {
            if (err) {
                return res.redirect("/invitation?message=" + encodeURIComponent("Error rejecting group"));
            }
            return res.redirect("/invitation?message=" + encodeURIComponent("Group invitation rejected"));
        }
    );
}

function sendGroupMessage(req, res) {
    const sender_id = req.session.user_id;
    const group_id = req.body.group_id;
    const message = req.body.message;

    db.query(
        "INSERT INTO messages (user_id, message, group_id) VALUES (?, ?, ?)",
        [sender_id, message, group_id],
        (err) => {
            if (err) {
                return res.json({ success: false, error: err.message });
            }
            res.json({ success: true });
        }
    );
}

module.exports = {
    showGroup,
    createGroup,
    acceptGroup,
    rejectGroup,
    sendGroupMessage
};
