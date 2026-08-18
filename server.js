const express = require("express");
const session = require("express-session");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();

const users = {};
const socketToUser = {};

const { showfriends, showGroups } = require("./middleware/friend");
const authRoutes = require("./routes/authroutes");
const homeRoutes = require("./routes/homeroutes");
const chatRoutes = require("./routes/chatroutes");
const callingRoutes = require("./routes/callingroutes");

app.use(session({
    secret: "priya_key",
    resave: false,
    saveUninitialized: false
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const httpServer = http.createServer(app);
const io = new Server(httpServer);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

function getOnlineUsers() {
    return Object.keys(users).map((user_id) => ({
        user_id: user_id,
        name: users[user_id].name
    }));
}

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Identify user
    socket.on("identify", (data) => {
        const user_id = String(data.user_id ?? "");
        const name = data.name || "User";

        if (!user_id) {
            return;
        }

        const oldUser = users[user_id];

        if (oldUser && oldUser.socketId !== socket.id) {
            delete socketToUser[oldUser.socketId];
        }

        users[user_id] = {
            socketId: socket.id,
            name: name
        };

        socketToUser[socket.id] = user_id;

        socket.emit("online_users", getOnlineUsers());

        socket.broadcast.emit("user_online", {
            user_id: user_id,
            name: name
        });

        console.log("User identified:", user_id);
    });

    // Typing start
    socket.on("typing_start", (data) => {
        const receiverId = String(data.receiver_id);
        const receiver = users[receiverId];

        if (!receiver) {
            return;
        }

        io.to(receiver.socketId).emit("typing_start", {
            sender_id: String(data.sender_id),
            name:
                data.name ||
                users[String(data.sender_id)]?.name ||
                "User"
        });
    });

    // Typing stop
    socket.on("typing_stop", (data) => {
        const receiver = users[String(data.receiver_id)];

        if (!receiver) {
            return;
        }

        io.to(receiver.socketId).emit("typing_stop", {
            sender_id: String(data.sender_id)
        });
    });

    // Chat message
    socket.on("send_message", (data) => {
        const receiver = users[String(data.receiver_id)];

        if (!receiver) {
            console.log("Receiver is offline:", data.receiver_id);
            return;
        }

        io.to(receiver.socketId).emit(
            "receive_message",
            data
        );
    });

    // Call user
    socket.on("call-user", (data) => {
        const receiver = users[String(data.receiver_id)];

        console.log(
            "Call:",
            data.sender_id,
            "->",
            data.receiver_id
        );

        if (!receiver) {
            socket.emit("call-failed", {
                reason: "offline"
            });
            return;
        }

        io.to(receiver.socketId).emit("incoming-call", {
            sender_id: String(data.sender_id),
            receiver_id: String(data.receiver_id),
            sender_name:
                users[String(data.sender_id)]?.name ||
                "User",
            offer: data.offer,
            call_type: data.call_type || "video"
        });
    });

    // Answer call
    socket.on("answer-call", (data) => {
        const caller = users[String(data.caller_id)];

        if (!caller) {
            socket.emit("call-failed", {
                reason: "caller_offline"
            });
            return;
        }

        io.to(caller.socketId).emit("call-answer", {
            answer: data.answer
        });
    });

    // Reject call
    socket.on("reject-call", (data) => {
        const caller = users[String(data.caller_id)];

        if (!caller) {
            return;
        }

        io.to(caller.socketId).emit("call-rejected");
    });

    // ICE candidate
    socket.on("ice-candidate", (data) => {
        const receiver = users[String(data.target_id)];

        if (!receiver) {
            return;
        }

        io.to(receiver.socketId).emit("ice-candidate", {
            sender_id: String(data.sender_id),
            candidate: data.candidate
        });
    });

    // End call
    socket.on("end-call", (data) => {
        const receiver = users[String(data.target_id)];

        if (!receiver) {
            return;
        }

        io.to(receiver.socketId).emit("call-ended", {
            sender_id: String(data.sender_id)
        });
    });

    // Groups
    socket.on("join_group", (data) => {
        const group_id = String(data.group_id ?? data);

        if (!group_id) {
            return;
        }

        socket.join("group_" + group_id);
    });

    socket.on("send_group_message", (data) => {
        const group_id = String(data.group_id);

        if (!group_id || !data.message) {
            return;
        }

        socket.to("group_" + group_id).emit(
            "receive_group_message",
            {
                group_id: group_id,
                sender_id: String(data.sender_id),
                sender_name:
                    data.sender_name ||
                    users[String(data.sender_id)]?.name ||
                    "User",
                message: data.message,
                date:
                    data.date ||
                    new Date().toISOString()
            }
        );
    });

    socket.on("group_typing_start", (data) => {
        const group_id = String(data.group_id);

        if (!group_id) {
            return;
        }

        socket.to("group_" + group_id).emit(
            "group_typing_start",
            {
                group_id: group_id,
                sender_id: String(data.sender_id),
                name:
                    data.name ||
                    users[String(data.sender_id)]?.name ||
                    "User"
            }
        );
    });

    socket.on("group_typing_stop", (data) => {
        const group_id = String(data.group_id);

        if (!group_id) {
            return;
        }

        socket.to("group_" + group_id).emit(
            "group_typing_stop",
            {
                group_id: group_id,
                sender_id: String(data.sender_id)
            }
        );
    });

    // Disconnect
    socket.on("disconnect", () => {
        const user_id = socketToUser[socket.id];

        if (user_id) {
            if (
                users[user_id] &&
                users[user_id].socketId === socket.id
            ) {
                delete users[user_id];

                socket.broadcast.emit(
                    "user_offline",
                    {
                        user_id: user_id
                    }
                );
            }

            delete socketToUser[socket.id];
        }

        console.log(
            "Client disconnected:",
            socket.id
        );
    });
});

app.get("/", (req, res) => {
    res.render("login");
});

app.use(showfriends);
app.use(showGroups);
app.use(authRoutes);
app.use(homeRoutes);
app.use(chatRoutes);
app.use(callingRoutes);

httpServer.listen(3030, () => {
    console.log("Server is running on port 3030");
});