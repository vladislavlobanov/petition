const express = require("express");
const app = express();
const db = require("./db");
const hb = require("express-handlebars");
const csurf = require("csurf");
const bcrypt = require("./bcrypt");
const cookieSession = require("cookie-session");
const {
    requireLoggedOutUser,
    requireLoggedInUser,
    requireNoSignature,
    requireSignature,
} = require("./middleware");

var smthWrong;

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(express.static("./public"));

app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: true,
    })
);

app.use(csurf());

app.use(function (req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use(requireLoggedInUser);

app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/petition", requireNoSignature, (req, res) => {
    smthWrong = false;
    res.render("welcome", {
        layout: "main",
    });
});

app.post("/petition", requireNoSignature, (req, res) => {
    if (req.body.hiddenField == "") {
        smthWrong = true;
        res.render("welcome", {
            layout: "main",
            smthWrong,
        });
    } else {
        db.sendInputs(req.session.user, req.body.hiddenField)
            .then((rData) => {
                smthWrong = false;
                req.session.sigId = rData.rows[0].id;
                res.redirect("/petition/signed");
            })
            .catch((err) => {
                console.log(err);
                smthWrong = true;
                res.render("welcome", {
                    layout: "main",
                    smthWrong,
                });
            });
    }
});

app.get("/register", requireLoggedOutUser, (req, res) => {
    console.log(req.session);
    smthWrong = false;
    res.render("register", {
        layout: "main",
    });
});

app.post("/register", requireLoggedOutUser, (req, res) => {
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

app.get("/profile", (req, res) => {
    smthWrong = false;
    res.render("profile", {
        layout: "main",
        smthWrong,
    });
});

app.post("/profile", (req, res) => {
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

app.get("/login", requireLoggedOutUser, (req, res) => {
    smthWrong = false;
    res.render("login", {
        layout: "main",
        smthWrong,
    });
});

app.post("/login", requireLoggedOutUser, (req, res) => {
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

app.get("/petition/signed", requireSignature, (req, res) => {
    var firstPromise = db.getSignature(req.session.sigId).then((results) => {
        return results.rows[0].signature;
    });

    var secondPromise = db.showSupporters().then((results) => {
        return results.rows.length;
    });

    Promise.all([firstPromise, secondPromise]) //MAYBE REWRITE USING A CHAIN
        .then((values) => {
            var imgSig = values[0];
            var numSigned = values[1];
            res.render("signed", {
                layout: "main",
                imgSig,
                numSigned,
            });
        })
        .catch((err) => {
            console.log("Error in one of the promises" + err); //showmessage smth went wrong STILL have to do it visually
        });
});

app.post("/petition/signed", requireSignature, (req, res) => {
    db.deleteSignature(req.session.user).then(() => {
        req.session.sigId = "";
        res.redirect("/petition");
    });
});

app.get("/petition/supporters", requireSignature, (req, res) => {
    db.showSupporters().then((results) => {
        var arr = results.rows;
        res.render("supporters", {
            layout: "main",
            arr,
        }); //showmessage smth went wrong STILL have to do it visually
    });
});

app.get("/petition/:city", requireSignature, (req, res) => {
    const { city: cityParam } = req.params;
    db.showCity(cityParam).then((results) => {
        var arr = results.rows;
        res.render("supporters-by-city", {
            layout: "main",
            cityParam,
            arr,
        }); //showmessage smth went wrong STILL have to do it visually
    });
});

app.get("/edit", (req, res) => {
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

app.post("/edit", (req, res) => {
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

app.get("*", (req, res) => {
    res.statusCode = 404;
    res.send("404 PAGE DOESN'T EXIST");
});

app.listen(process.env.PORT || 8080, () =>
    console.log("petition server is listening...")
);
