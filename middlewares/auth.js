const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('authorization');
  console.log({url: req.url});

  if (req?.url === "/home-chefs") {
    next();
    return
  }

  if (!token) {
    return res.status(400).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(400).json({ msg: 'Token is not valid' });
  }
};