const express = require("express");
const router = express.Router();
const { requireSignature } = require("../middleware");
const db = require("../db");

router.get("/petition/signed", requireSignature, (req, res) => {
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
            console.log("Error in one of the promises" + err);
        });
});

router.post("/petition/signed", requireSignature, (req, res) => {
    db.deleteSignature(req.session.user).then(() => {
        req.session.sigId = "";
        res.redirect("/petition");
    });
});

router.get("/petition/supporters", requireSignature, (req, res) => {
    db.showSupporters().then((results) => {
        var arr = results.rows;
        res.render("supporters", {
            layout: "main",
            arr,
        });
    });
});

router.get("/petition/:city", requireSignature, (req, res) => {
    const { city: cityParam } = req.params;
    db.showCity(cityParam).then((results) => {
        var arr = results.rows;
        res.render("supporters-by-city", {
            layout: "main",
            cityParam,
            arr,
        });
    });
});

module.exports = router;
