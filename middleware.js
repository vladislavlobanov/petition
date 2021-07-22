// if a logged-in user tries to access our register or login pages, they should be redirected away from those pages!
module.exports.requireLoggedOutUser = (req, res, next) => {
    // is the user logged in???
    if (req.session.user) {
        return res.redirect("/petition");
    }
    // only if user is NOT logged in do you proceed to the rest of the code
    next();
};

module.exports.requireLoggedInUser = (req, res, next) => {
    if (!req.session.user && req.url != "/register" && req.url != "/login") {
        return res.redirect("/register");
    }
    // only if user IS logged in do you proceed to the rest of the code
    next();
};

module.exports.requireNoSignature = (req, res, next) => {
    // does the user have a signature?? if so, we want to redirect away!!
    if (req.session.sigId) {
        res.redirect("/petition/signed");
    } else {
        // only if they DON'T have a signature do you proceed to the rest of the code
        next();
    }
};

module.exports.requireSignature = (req, res, next) => {
    if (!req.session.sigId) {
        return res.redirect("/petition");
    }
    // only if they HAVE a signature do you proceed to the rest of the code
    next();
};
