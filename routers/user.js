const express = require("express");
const router = express.Router();
const { requireLoggedOutUser } = require("../middleware");
const bcrypt = require("../bcrypt");
const db = require("../db");
var smthWrong;

router.get("/register", requireLoggedOutUser, (req, res) => {
    smthWrong = false;
    res.render("register", {
        layout: "main",
    });
});

router.post("/register", requireLoggedOutUser, (req, res) => {
    if (
        !req.body.firstName ||
        !req.body.lastName ||
        !req.body.email ||
        !req.body.password
    ) {
        smthWrong = true;
        res.render("register", {
            layout: "main",
            smthWrong,
        });
    } else {
        bcrypt
            .hash(req.body.password)
            .then((hashPwd) => {
                return db
                    .registration(
                        req.body.firstName,
                        req.body.lastName,
                        req.body.email,
                        hashPwd
                    )
                    .then((userId) => {
                        req.session.user = userId.rows[0].id;
                        req.session.name = req.body.firstName;
                        req.session.surname = req.body.lastName;
                        res.redirect("/profile");
                    });
            })
            .catch((err) => {
                smthWrong = true;
                res.render("register", {
                    layout: "main",
                    smthWrong,
                });
            });
    }
});

router.get("/profile", (req, res) => {
    smthWrong = false;
    res.render("profile", {
        layout: "main",
        smthWrong,
    });
});

router.post("/profile", (req, res) => {
    if (!req.body.age && !req.body.city && !req.body.homepage) {
        res.redirect("/petition");
    } else {
        db.sendAddition(
            req.body.age ? req.body.age : null,
            req.body.city ? req.body.city : null,
            req.body.homepage ? req.body.homepage : null,
            req.session.user
        )
            .then(() => {
                res.redirect("/petition");
            })
            .catch((err) => {
                smthWrong = true;
                console.log(err);
                res.render("profile", {
                    layout: "main",
                    smthWrong,
                });
            });
    }
});

router.get("/login", requireLoggedOutUser, (req, res) => {
    smthWrong = false;
    res.render("login", {
        layout: "main",
        smthWrong,
    });
});

router.post("/login", requireLoggedOutUser, (req, res) => {
    if (!req.body.email || !req.body.password) {
        smthWrong = true;
        res.render("register", {
            layout: "main",
            smthWrong,
        });
    } else {
        db.findUser(req.body.email)
            .then((results) => {
                return bcrypt
                    .compare(req.body.password, results.rows[0].hashed_password)
                    .then((comparison) => {
                        if (comparison == false) {
                            throw new Error("Password doesn't match");
                        } else {
                            if (results.rows[0].signature) {
                                req.session.sigId = results.rows[0].sigid;
                                req.session.name = results.rows[0].first;
                                req.session.surname = results.rows[0].last;
                                req.session.user = results.rows[0].id;
                                res.redirect("/petition");
                            } else {
                                req.session.name = results.rows[0].first;
                                req.session.surname = results.rows[0].last;
                                req.session.user = results.rows[0].id;
                                res.redirect("/petition");
                            }
                        }
                    });
            })
            .catch((err) => {
                smthWrong = true;
                console.log(err);
                res.render("login", {
                    layout: "main",
                    smthWrong,
                });
            });
    }
});

router.get("/edit", (req, res) => {
    db.provideInfo(req.session.user)
        .then((results) => {
            const { firstname, lastname, email, age, city, homepage } =
                results.rows[0];

            res.render("edit", {
                layout: "main",
                firstname,
                lastname,
                email,
                age,
                city,
                homepage,
            });
        })
        .catch((err) => console.log(err));
});

router.post("/edit", (req, res) => {
    if (req.body.password) {
        bcrypt
            .hash(req.body.password)
            .then((hashPwd) => {
                db.makeUpdatesWPwd(
                    req.body.firstName,
                    req.body.lastName,
                    req.body.email,
                    hashPwd,
                    req.body.age || null,
                    req.body.city || null,
                    req.body.homepage || null,
                    req.session.user
                ).then(() => {
                    res.redirect("/petition/supporters");
                });
            })
            .catch((err) => console.log(err));
    } else {
        db.makeUpdatesNoPwd(
            req.body.firstName,
            req.body.lastName,
            req.body.email,
            req.body.age || null,
            req.body.city || null,
            req.body.homepage || null,
            req.session.user
        )
            .then(() => {
                res.redirect("/petition/supporters");
            })
            .catch((err) => console.log(err));
    }
});

module.exports = router;
