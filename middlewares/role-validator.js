const jwt = require('jsonwebtoken');

module.exports = (roles) => {
    return (req, res, next) => {
        const token = req.header('authorization');

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userRole = decoded?.user?.role;
            if (roles.findIndex(role => {
                return role === userRole
            }) === -1) {
                res.status(401).json({ msg: 'Not authorized!' });
                return;
            }
            next();
        } catch (err) {
            res.status(401).json({ msg: 'Token is not valid' });
        }
    };
}