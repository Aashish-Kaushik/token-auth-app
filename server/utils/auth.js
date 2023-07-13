const jwt = require('jsonwebtoken');
const { tokens } = require('../data/data');

const dev = process.env.NODE_ENV === 'development';

exports.generatedJWT = (userId, secret, expirationTime) => {
    return jwt.sign({
        userId
    },
        secret,
        { expiresIn: expirationTime })
}

exports.clearTokens = async (req, res) => {
    const { signedCookies = {} } = req;
    const { refreshToken } = signedCookies;
    if (refreshToken) {
        const index = tokens.findIndex(token => token.refreshToken === refreshToken);
        if (index) {
            tokens.splice(index, 1);
        }
    }
    res.clearCookies('refreshToken', {
        httpOnly: true,
        secure: !dev,
        signed: true
    })
}
