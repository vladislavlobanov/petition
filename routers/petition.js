const express = require("express");
const router = express.Router();
const { requireNoSignature } = require("../middleware");
const db = require("../db");
var smthWrong;

router.get("/", (req, res) => {
    res.redirect("/petition");
});

router.get("/petition", requireNoSignature, (req, res) => {
    smthWrong = false;
    res.render("welcome", {
        layout: "main",
    });
});

router.post("/petition", requireNoSignature, (req, res) => {
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

module.exports = router;
