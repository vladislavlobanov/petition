var spicedPg = require("spiced-pg");
var db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/petition"
);

module.exports.sendInputs = (user_id, signatures) => {
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
        `INSERT INTO signatures (user_id, signature, date) VALUES ($1,$2,$3) RETURNING id;`,
        [user_id, signatures, currentDate]
    );
};

module.exports.sendAddition = (age, city, homepage, user_id) => {
    return db.query(
        `INSERT INTO profiles (age, city, homepage, user_id) VALUES ($1,$2,$3,$4);`,
        [age, city, homepage, user_id]
    );
};

module.exports.showSupporters = () => {
    return db.query(`SELECT users.first AS firstName, users.last AS lastName, signatures.signature AS signature, profiles.age AS age, profiles.city AS city, profiles.homepage AS homepage
    FROM users
    INNER JOIN signatures ON users.id = signatures.user_id
    LEFT JOIN profiles ON signatures.user_id = profiles.user_id;
    `);
};

module.exports.showCity = (city) => {
    return db.query(
        `SELECT users.first AS firstName, users.last AS lastName, signatures.signature AS signature, profiles.age AS age, profiles.city AS city, profiles.homepage AS homepage 
    FROM users 
    INNER JOIN signatures ON users.id = signatures.user_id
    INNER JOIN profiles ON signatures.user_id = profiles.user_id
    WHERE LOWER(profiles.city) = LOWER($1);
    `,
        [city]
    );
};

module.exports.getSignature = (id) => {
    return db.query(`SELECT * FROM signatures WHERE id = ($1);`, [id]);
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
        `INSERT INTO users (first, last, email, hashed_password, date) VALUES ($1,$2,$3,$4,$5) RETURNING id;`,
        [first, last, email, password, currentDate]
    );
};

module.exports.findUser = (email) => {
    return db.query(
        `SELECT users.first AS firstName, users.last AS lastName, users.id as id, users.hashed_password AS hashed_password, signatures.signature as signature, signatures.id as sigid
    FROM users
    LEFT JOIN signatures ON users.id = signatures.user_id
    WHERE users.email = ($1);`,
        [email]
    );
};

module.exports.provideInfo = (id) => {
    return db.query(
        `SELECT users.first AS firstName, users.last AS lastName, users.email AS email, profiles.age AS age, profiles.city as city, profiles.homepage AS homepage
        FROM users
        LEFT JOIN profiles ON users.id = profiles.user_id
        WHERE users.id = ($1);`,
        [id]
    );
};

module.exports.makeUpdatesNoPwd = (
    first,
    last,
    email,
    age,
    city,
    homepage,
    idData
) => {
    return db.query(
        `WITH i AS (UPDATE users SET first = ($1), last = ($2), email = ($3) WHERE id = ($4))
        INSERT INTO profiles (user_id, age, city, homepage)
        VALUES ($4,$5,$6,$7)
        ON CONFLICT (user_id)
        DO UPDATE SET age = ($5), city = ($6), homepage=($7);
`,
        [first, last, email, idData, age, city, homepage]
    );
};

module.exports.makeUpdatesWPwd = (
    first,
    last,
    email,
    password,
    age,
    city,
    homepage,
    idData
) => {
    return db.query(
        `WITH i AS (UPDATE users SET first = ($1), last = ($2), email = ($3), hashed_password=($4) WHERE id = ($5))
        INSERT INTO profiles (user_id, age, city, homepage)
        VALUES ($5,$6,$7,$8)
        ON CONFLICT (user_id)
        DO UPDATE SET age = ($6), city = ($7), homepage=($8);
`,
        [first, last, email, password, idData, age, city, homepage]
    );
};

module.exports.deleteSignature = (id) => {
    return db.query(`DELETE FROM signatures WHERE user_id = ($1);`, [id]);
};
