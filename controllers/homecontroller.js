const { db } = require("../db");

function showhome(req, res) {
    const user_id = req.session.user_id;
    
        res.render("home", { user_id: user_id});
    }


function addFriend(req, res) {
    const sender_id = req.session.user_id;

    db.query("SELECT user_id FROM user WHERE mobile = ?", [req.body.mobile], (err, results) => {
        if (err) {
            return res.redirect("/home?message=" + encodeURIComponent("Error adding friend"));
        }

        if (results.length === 0) {
            return res.redirect("/home?message=" + encodeURIComponent("User not found"));
        }

        const receiver_id = results[0].user_id;

        db.query(
            "INSERT INTO friends (user_id, receiver_id, status) VALUES (?, ?, ?)",
            [sender_id, receiver_id, 0],
            (insertErr) => {
                if (insertErr) {
                    return res.redirect("/home?message=" + encodeURIComponent("Error adding friend"));
                }
                return res.redirect("/home?message=" + encodeURIComponent("Friend request sent successfully"));
            }
        );
    });
}

function showInvitations(req, res) {
    const user_id = req.session.user_id;

    db.query(
        `SELECT friends.unique_id, user.name
         FROM friends
         JOIN user ON friends.user_id = user.user_id
         WHERE friends.receiver_id = ? AND friends.status = 0`,
        [user_id],
        (err, results) => {
            if (err) {
                console.log(err);
                return res.redirect("/home?message=" + encodeURIComponent("Error showing friend requests"));
            }

            db.query(
                `SELECT group_member.group_id, group_member.user_id, group_member.status,
                        g.group_name, user.name AS inviter_name
                 FROM group_member
                 JOIN \`group\` g ON group_member.group_id = g.group_id
                 JOIN user ON group_member.invited_by = user.user_id
                 WHERE group_member.user_id = ? AND group_member.status = 0`,
                [user_id],
                (groupErr, groupResults) => {
                    if (groupErr) {
                        console.log(groupErr);
                        return res.redirect("/home?message=" + encodeURIComponent("Error showing group requests"));
                    }

                    return res.render("invitation", {
                        requests: results,
                        group_requests: groupResults,
                        message: req.query.message || null
                    });
                }
            );
        }
    );
}

function myInvitations(req, res) {
    const user_id = req.session.user_id;

    db.query(
        `SELECT friends.unique_id, friends.status, user.name
         FROM friends
         JOIN user ON friends.receiver_id = user.user_id
         WHERE friends.user_id = ? AND friends.status = 0`,
        [user_id],
        (err, results) => {
            if (err) {
                return res.redirect("/home?message=" + encodeURIComponent("Error showing friend requests"));
            }

            db.query(
                `SELECT group_member.group_id, group_member.status,
                        g.group_name, user.name AS member_name
                 FROM group_member
                 JOIN \`group\` g ON group_member.group_id = g.group_id
                 JOIN user ON group_member.user_id = user.user_id
                 WHERE group_member.invited_by = ? AND group_member.status = 0`,
                [user_id],
                (groupErr, groupResults) => {
                    if (groupErr) {
                        console.log(groupErr);
                        return res.redirect("/home?message=" + encodeURIComponent("Error showing group invitations"));
                    }

                    return res.render("myInvitation", {
                        invitations: results,
                        group_invitations: groupResults,
                        message: req.query.message || null
                    });
                }
            );
        }
    );
}

function updatefriend(req, res) {
    db.query("UPDATE friends SET status = 1 WHERE unique_id = ?", [req.body.unique_id], (err) => {
        if (err) {
            return res.redirect("/invitation?message=" + encodeURIComponent("Error updating friend"));
        }
        return res.redirect("/invitation?message=" + encodeURIComponent("Friend updated successfully"));
    });
}

function rejectfriend(req, res) {
    db.query("DELETE FROM friends WHERE unique_id = ?", [req.body.unique_id], (err) => {
        if (err) {
            return res.redirect("/invitation?message=" + encodeURIComponent("Error rejecting friend"));
        }
        return res.redirect("/invitation?message=" + encodeURIComponent("Friend rejected successfully"));
    });
}

module.exports = {
    showhome,
    addFriend,
    showInvitations,
    updatefriend,
    myInvitations,
    rejectfriend
};
