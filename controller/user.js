const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('user/register');
};

module.exports.createUser = async (req, res, next) => {
    try {
        const {username, password, email} = req.body;
        // create new user 
        const newUser = new User({email, username});
        // store user with hashed password
        const registerdUser = await User.register(newUser, password);
        // log user in after registering
        req.login(registerdUser, err => {
            if (err) return next();
            req.flash('success', 'Welcome to YelpCamp');
            res.redirect('/campgrounds');
        })
    }  catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
};


module.exports.renderLogin = (req, res) => {
    res.render('user/login');
};


module.exports.directLogin = (req, res) => {
    req.flash('success', 'Welcome back!');
    // direct user to link wanted to reach when not log in yet
    const redirectUrl = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Goodbye!');
    res.redirect('/');
};


