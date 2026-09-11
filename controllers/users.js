const User = require('../models/user');

module.exports.renderRegister = (req,res) =>{
    res.json({ message: "Register Form" });
}

module.exports.register = async(req,res,next) => {
    try{
        const {email, username, password} = req.body;
        const user = new User({email,username});
        const registeredUser = await User.register(user,password);
        req.login(registeredUser, err => {
            if(err) return next(err);
            res.status(201).json({ user: registeredUser, message: 'Welcome to Yelp Camp!!' });
        })
    } catch(e){
        res.status(400).json({ error: e.message });
    }
}

module.exports.renderLogin = (req,res) => {
    res.json({ message: "Login Form" });
}

module.exports.login = (req,res) => {
    res.json({ message: 'welcome back!!', user: req.user });
}

module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.json({ message: 'Goodbye!' });
    });
}