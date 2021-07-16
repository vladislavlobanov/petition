const express = require("express");
const app = express();
const db = require("./db");
const hb = require("express-handlebars");
const cookieParser = require("cookie-parser");
var smthWrong;
var arr;

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(cookieParser());
app.use(express.static("./public"));

app.use((req, res, next) => {
    if (!req.cookies.signed && req.url != "/petition") {
        res.redirect("/petition");
    } else next(); // HANDLE 404 pages

    // else if (
    //     req.cookies.signed &&
    //     req.url != "/petition/signed" &&
    //     req.url != "/petition/supporters" // Create generic 404?
    // ) {
    //     res.redirect("/petition/signed");
    // }
});

app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    if (req.cookies.signed) {
        res.redirect("/petition/signed");
    } else {
        smthWrong = false;
        res.render("welcome", {
            layout: "main",
        });
    }
});

app.get("/petition/signed", (req, res) => {
    res.render("signed", {
        layout: "main",
        arr,
    });
});

app.get("/petition/supporters", (req, res) => {
    db.showSupporters().then((results) => {
        arr = results.rows;
        res.render("supporters", {
            layout: "main",
            arr,
        }); // HANDLE CATCH IF ERR
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
            .then(() => {
                smthWrong = false;
                res.cookie("signed", true);
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

app.listen(8080, () => console.log("petition server is listening..."));
