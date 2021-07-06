module.exports = function(req, res, next) {
    res.locals.isAuth = req.session.isAuthenicated
    res.locals.csrf = req.csrfToken()
    
    next()
}