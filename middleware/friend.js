const { db } = require("../db");

function showfriends(req, res, next) {
    const user_id = req.session.user_id;

    if (!user_id) {
        res.locals.contacts = [];
        res.locals.current_user_id = null;
        res.locals.current_user_name = null;
        res.locals.current_user_photo = null;
        return next();
    }

    res.locals.current_user_id = user_id;

    db.query(
        `SELECT user.user_id, user.name, user.profile_photo
         FROM user
         JOIN friends ON (
            (friends.user_id = ? AND friends.receiver_id = user.user_id)
            OR
            (friends.receiver_id = ? AND friends.user_id = user.user_id)
         )
         WHERE friends.status = 1`,
        [user_id, user_id],
        (err, results) => {
            if (err) {
                return next(err);
            }

            res.locals.contacts = results;

            db.query(
                "SELECT name, profile_photo FROM user WHERE user_id = ?",
                [user_id],
                (nameErr, nameResults) => {
                    if (nameErr) {
                        return next(nameErr);
                    }

                    res.locals.current_user_name = nameResults[0]
                        ? nameResults[0].name
                        : "User";
                    res.locals.current_user_photo = nameResults[0]
                        ? nameResults[0].profile_photo
                        : null;
                    next();
                }
            );
        }
    );
}

function showGroups(req, res, next) {
    const user_id = req.session.user_id;

    if (!user_id) {
        res.locals.groups = [];
        return next();
    }

    db.query(
        `SELECT g.group_id, g.group_name, g.group_profile, user.name as user_name
         FROM \`group\` g
         JOIN user ON user.user_id = g.created_by
         JOIN group_member gm ON gm.group_id = g.group_id
         WHERE gm.user_id = ? AND gm.status = 1`,
        [user_id],
        (err, results) => {
            if (err) {
                return next(err);
            }

            res.locals.groups = results;
            next();
        }
    );
}

function isLoggedIn(req, res, next) {
    if (!req.session.user_id) {
        return res.redirect("/login");
    }
    next();
}

module.exports = {
    showfriends,
    showGroups,
    isLoggedIn
};
