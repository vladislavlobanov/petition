var spicedPg = require("spiced-pg");
var db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

module.exports.sendInputs = (first, last, signatures) => {
    var options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false,
    };
    var currentDate = new Intl.DateTimeFormat("en-US", options).format(
        currentDate
    );

    return db.query(
        `INSERT INTO signatures (first, last, signature, date) VALUES ($1,$2,$3,$4)`,
        [first, last, signatures, currentDate]
    );
};

module.exports.showRows = (first, last, signatures) => {
    db.query("SELECT * FROM signatures")
        .then(function (result) {
            console.log(result.rows);
        })
        .catch(function (err) {
            console.log(err);
        });
};
