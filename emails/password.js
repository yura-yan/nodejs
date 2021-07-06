const keys = require('../keys')

module.exports = function(email, token) {
    return {
        to: email,
        from: keys.COMPANY_EMAIL,
        subject: 'Password reset',
        html: `
        <h1>You want to reset your password if you don't please connect to our service imediately!</h1>
        <p>Please get the link bellow to reset your password</p>
        <p><a href="${keys.BASE_URL}/auth/password/${token}">Reset password</a></p>
        <hr />
        <a href="${keys.BASE_URL}">Courses shop</a>
        `
    }
}