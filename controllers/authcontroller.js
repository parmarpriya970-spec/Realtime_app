const { db } = require("../db");


function showlogin(req, res) {
    
    res.render("login", { message: req.query.message || null });
}

function login(req, res) {
    const { name, pin } = req.body;

    if (!name || !pin ) {
        return res.redirect("/login?message=" + encodeURIComponent("Please fill all the details."));
    }

    db.query(
        "SELECT * FROM user WHERE name = ? AND pin = ?",
        [name, pin],
        (err, loginresult) => {
            if (err) {
                console.error(err);
                return res.redirect("/login?message=" + encodeURIComponent("error in login."));
            }
            if (loginresult.length === 0) {
                return res.redirect("/login?message=" + encodeURIComponent("Invalid details."));
            }
            req.session.user_id = loginresult[0].user_id;


            return res.redirect("/home?message=" + encodeURIComponent("Login successful"));
        }
    );
}
function logout(req, res) {

    req.session.destroy((err) => {

        if (err) {
            console.log(err);
            return res.send("Logout failed");
        }

        res.redirect("/login");
    });

}
function showRegister(req, res) {
    res.render("login", {
        message: req.query.message || null
    });
}

function register(req, res) {
    const { name, pin, date_of_birth, mobile  } = req.body;

    if (!name || !pin || !date_of_birth || !mobile) {
        return res.redirect("/login?message=" + encodeURIComponent("Please fill all fields."));
    }

    

    db.query(
        "INSERT INTO user (name, pin, date_of_birth, mobile) VALUES (?, ?, ?, ?) ",
        [name, pin, date_of_birth, mobile],
        (err, results) => {
            if (err) {
                console.error(err);

                if (err.code === "ER_DUP_ENTRY") {
                    return res.redirect(
                        "/login?message=" + encodeURIComponent("Name already exists")
                    );
                }
                return res.redirect("/login?message=" + encodeURIComponent("Failed to register user."));
            }

            req.session.user_id = results.insertId;
           
            return res.redirect("/home?message=" + encodeURIComponent("User registered successfully"));
        }
    );
}


function showforget (req, res) {
    res.render("forget", { message: req.query.message || null });
}

function forget (req, res) {

    const { name  , mobile } = req.body;

    db.query("SELECT * FROM user WHERE name = ? AND mobile = ?", [name, mobile], (err, forgetresult) => {
        if (err) {
            console.error(err);
            return res.redirect("/forget?message=" + encodeURIComponent("Error in forget password."));
        }

       
        if (forgetresult.length === 0) {
            return res.redirect("/forget?message=" + encodeURIComponent("Invalid details."));
        }
        return res.redirect("/newPIN?user_id=" + encodeURIComponent(forgetresult[0].user_id));


    });
}

function showNewpin (req, res) {
    res.render("newPIN", { message: req.query.message || null, user_id: req.query.user_id || null });
}

function newpin (req, res) {
const { pin, confirm_pin, user_id } = req.body;

if (!pin || !confirm_pin) {
    return res.redirect("/newPIN?message=" + encodeURIComponent("Please fill all fields."));
}

if (pin !== confirm_pin) {
    return res.redirect("/newPIN?message=" + encodeURIComponent("PIN and Confirm PIN do not match."));
}

db.query("UPDATE user SET pin = ? WHERE user_id = ?", [pin, user_id], (err, newPINresult) => {
    if (err) {
        console.error(err);
        return res.redirect("/newPIN?message=" + encodeURIComponent("Error in setting new PIN."));
    }
    return res.redirect("/login?message=" + encodeURIComponent("New PIN set successfully."));
});
}

module.exports = { showRegister, register, showlogin, 
    login, logout, showforget, forget, showNewpin, newpin };
