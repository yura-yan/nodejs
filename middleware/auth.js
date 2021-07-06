module.exports = function(req, res, next) {
    if (!req.session.isAuthenicated) {
        return res.redirect('/auth/login')
    }

    next()
}