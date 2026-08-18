const express = require("express");
const router = express.Router();

router.get("/calling", async (req, res) => {
    try {
        const sender_id = req.session.user_id;
        const sender_name = req.session.user_name;

        const receiver_id = req.query.receiver_id;
        const role = req.query.role || "caller";
        const call_type = req.query.type || "video";

        const receiver_name = "User";

        res.render("calling", {
            sender_id: sender_id,
            sender_name: sender_name,
            receiver_id: receiver_id,
            receiver_name: receiver_name,
            role: role,
            call_type: call_type
        });
    } catch (error) {
        console.error("Calling route error:", error);
        res.status(500).send("Unable to start call");
    }
});

module.exports = router;