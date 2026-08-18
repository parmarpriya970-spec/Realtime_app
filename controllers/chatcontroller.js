const { db } = require("../db");

function showChat(req,res) {
    const sender_id = req.session.user_id;
    const receiver_id = req.params.user_id;

    db.query(`SELECT *
        FROM messages
        WHERE
        (user_id = ? AND receiver_id = ?)
        OR
        (user_id = ? AND receiver_id = ?)`, [sender_id, receiver_id, receiver_id, sender_id], (err, results) => {
            if (err) {
                return res.redirect("/chat?error=" + encodeURIComponent(err.message));
            }

            db.query(
                "SELECT user_id, name, profile_photo FROM user WHERE user_id IN (?, ?)",
                [sender_id, receiver_id],
                (nameErr, nameResults) => {
                    if (nameErr) {
                        return res.redirect("/chat?error=" + encodeURIComponent(nameErr.message));
                    }

                    const sender = nameResults.find((user) => String(user.user_id) === String(sender_id));
                    const receiver = nameResults.find((user) => String(user.user_id) === String(receiver_id));

                    res.render("chat", {
                        sender_id,
                        receiver_id,
                        sender_name: sender ? sender.name : "You",
                        receiver_name: receiver ? receiver.name : "User",
                        messages: results,
                        receiver_photo: receiver ? receiver.profile_photo : null
                    });
                }
            );
        });
}

function sendMessage(req,res) {
    const sender_id = req.session.user_id;
    const receiver_id = req.body.receiver_id;
    const message = req.body.message;

    db.query("INSERT INTO messages (user_id, receiver_id, message) VALUES (?, ?, ?)", [sender_id, receiver_id, message], (err, results) => {
        if (err) {
            return res.json({ success: false, error: err.message });
        }
        res.json({ success: true });
    });
}
module.exports = {
    showChat,
    sendMessage
}