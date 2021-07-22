const express = require("express");
const app = express();

const hb = require("express-handlebars");
const csurf = require("csurf");

const cookieSession = require("cookie-session");
const { requireLoggedInUser } = require("./middleware");

const petition = require("./routers/petition");
const signed = require("./routers/signed");
const user = require("./routers/user");

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

app.use(petition);
app.use(signed);
app.use(user);

app.get("*", (req, res) => {
    res.statusCode = 404;
    res.send("404 PAGE DOESN'T EXIST");
});

app.listen(process.env.PORT || 8080, () =>
    console.log("petition server is listening...")
);
