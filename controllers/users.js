const User = require('../models/user')

module.exports.renderRegister = (req, res) => {
    res.render('users/register')
}

module.exports.register = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        //Passport adds a login method to our request object, and we need to pass in the user
        //It requires a callback function so we'll pass the error if there's one and call next with it so it reaches our error middleware.
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register')
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login')
}

module.exports.login = (req, res) => {
    //If successfully, we will pass the passport middleware and this code runs
    req.flash('success', 'Welcome Back!')
    //Check if user was trying to access a page when not logged in, or if nothing there, just go to /campgrounds
    const redirectUrl = req.session.returnTo || '/campgrounds'
    //Delete the url from the session so it won't be cluttered
    delete req.session.returnTo
    res.redirect(redirectUrl)
}

module.exports.logout = (req, res) => {
    //Passport also ads a logout method to the request object.
    req.logout();
    req.flash('success', 'Goodbye!');
    res.redirect('/campgrounds');
}