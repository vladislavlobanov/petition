var spicedPg = require("spiced-pg");
var db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

module.exports.sendInputs = (first, last, user_id, signatures) => {
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
        `INSERT INTO signatures (first, last, user_id, signature, date) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
        [first, last, user_id, signatures, currentDate]
    );
};

module.exports.showSupporters = () => {
    return db.query("SELECT * FROM signatures");
};

module.exports.getSignature = (id) => {
    return db.query(`SELECT * FROM signatures WHERE id = ${id}`);
};

module.exports.registration = (first, last, email, password) => {
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
        `INSERT INTO users (first, last, email, hashed_password, date) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
        [first, last, email, password, currentDate]
    );
};

module.exports.findUser = (email) => {
    return db.query(`SELECT * FROM users WHERE email = '${email}'`);
};

module.exports.findSignature = (userId) => {
    return db.query(`SELECT * FROM signatures WHERE user_id = '${userId}'`);
};
