const jwt = require('jsonwebtoken');
const PersonRoleMap = require("../enums/person-role");

module.exports = (req, res, next) => {
  const token = req.header('authorization');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const role = decoded.user.role;
    if (role !== PersonRoleMap.get("ADMIN")) res.json("This permission needs admin to execute it");
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};