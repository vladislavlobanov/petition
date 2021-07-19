const express = require("express");
const app = express();
const db = require("./db");
const hb = require("express-handlebars");
const csurf = require("csurf");
const bcrypt = require("./bcrypt");
const cookieSession = require("cookie-session"); // VAR?

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

app.use((req, res, next) => {
    if (
        !req.session.sigId &&
        (req.url == "/petition/supporters" || req.url == "/petition/signed")
    ) {
        res.redirect("/petition");
    } else next();
});

app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    console.log(req.session);
    if (!req.session.user) {
        res.redirect("/register");
    } else {
        if (req.session.sigId) {
            res.redirect("/petition/signed");
        } else {
            smthWrong = false;
            res.render("welcome", {
                layout: "main",
            });
        }
    }
});

app.get("/register", (req, res) => {
    if (req.session.user) {
        res.redirect("/petition");
    } else {
        smthWrong = false;
        res.render("register", {
            layout: "main",
        });
    }
});

app.post("/register", (req, res) => {
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
                    res.redirect("/petition");
                });
        })
        .catch((err) => {
            smthWrong = true;
            res.render("register", {
                layout: "main",
                smthWrong,
            });
        });
});

app.get("/login", (req, res) => {
    if (req.session.user) {
        res.redirect("/petition");
    } else {
        smthWrong = false;
        res.render("login", {
            layout: "main",
        });
    }
});

app.post("/login", (req, res) => {
    db.findUser(req.body.email)
        .then((results) => {
            return bcrypt
                .compare(req.body.password, results.rows[0].hashed_password)
                .then((comparison) => {
                    if (comparison == false) {
                        throw new Error("Password doesn't match");
                    } else {
                        return db
                            .findSignature(results.rows[0].id)
                            .then((sig) => {
                                if (sig.rows !== []) {
                                    req.session.sigId = sig.rows[0].id;
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
                            });
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
});

app.get("/petition/signed", (req, res) => {
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

app.get("/petition/supporters", (req, res) => {
    db.showSupporters().then((results) => {
        var arr = results.rows;
        res.render("supporters", {
            layout: "main",
            arr,
        }); //showmessage smth went wrong STILL have to do it visually
    });
});

app.post("/petition", (req, res) => {
    if (req.body.hiddenField == "") {
        smthWrong = true;
        res.render("welcome", {
            layout: "main",
            smthWrong,
        });
    } else {
        db.sendInputs(
            req.session.name,
            req.session.surname,
            req.session.user,
            req.body.hiddenField
        )
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

app.get("*", (req, res) => {
    res.statusCode = 404;
    res.send("404 PAGE DOESN'T EXIST");
});

app.listen(8080, () => console.log("petition server is listening..."));
