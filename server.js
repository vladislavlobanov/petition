const express = require("express");
const app = express();
const db = require("./db");
const hb = require("express-handlebars");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(express.static("./public"));

app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    res.render("welcome", {
        layout: "main",
    });
});

app.post("/petition", (req, res) => {
    db.sendInputs(req.body.firstName, req.body.lastName, req.body.hiddenField);
    db.showRows();
    res.send(`<!doctype html><h1>Success!</h1>`);
});

// app.get("/cities", (req, res) => {
//     db.getCities()
//         .then(({ rows }) => {
//             console.log("results in /cities ", rows);
//         })
//         .catch((err) => console.log("err in /cities ", err));
// });

app.listen(8080, () => console.log("petition server is listening..."));
