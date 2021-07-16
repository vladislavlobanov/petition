const express = require("express");
const app = express();
const db = require("./db");
const hb = require("express-handlebars");
var cookieSession = require("cookie-session");
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
    if (req.session.sigId) {
        res.redirect("/petition/signed");
    } else {
        smthWrong = false;
        res.render("welcome", {
            layout: "main",
        });
    }
});

app.get("/petition/signed", (req, res) => {
    var firstPromise = db.getSignature(req.session.sigId).then((results) => {
        return results.rows[0].signature;
    });

    var secondPromise = db.showSupporters().then((results) => {
        return results.rows.length;
    });

    Promise.all([firstPromise, secondPromise])
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
    if (
        req.body.firstName == "" ||
        req.body.lastName == "" ||
        req.body.hiddenField == ""
    ) {
        smthWrong = true;
        res.render("welcome", {
            layout: "main",
            smthWrong,
        });
    } else {
        db.sendInputs(
            req.body.firstName,
            req.body.lastName,
            req.body.hiddenField
        )
            .then((rData) => {
                smthWrong = false;
                req.session.sigId = rData.rows[0].id;
                res.redirect("/petition/signed");
            })
            .catch(() => {
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
