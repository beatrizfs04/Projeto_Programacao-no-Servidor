const jwt = require('jsonwebtoken');
const Users = require('./users');

module.exports.isAuthorized = async function (req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        const err = new Error('No token provided!');
        err.status = 401;
        return next(err);
    }


    jwt.verify(token, 'prgserver', async (err, decoded) => {
        if (err) {
            const error = new Error('Failed to authenticate token.');
            error.status = 401;
            return next(error);
        }

        const user = await Users.getUserByUsername(decoded.username)
        
        if (!user) {
            const err = new Error('Not authorized! Go back!');
            err.status = 401;
            return next(err);
        }
        
        req.user = { username: user['username'] , id: user['_id'] };
        return next();
    });
};
