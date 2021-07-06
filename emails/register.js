const keys = require('../keys')

module.exports = function(email) {
    return {
        to: email,
        from: keys.COMPANY_EMAIL,
        subject: 'Registration completed',
        html: `
        <h1>Welcome to our service</h1>
        <p>You registered in our service from email: ${email}</p>
        <hr />
        <a href="${keys.BASE_URL}">Courses shop</a>
        `
    }
}