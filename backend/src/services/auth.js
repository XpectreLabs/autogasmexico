const jwt = require('jsonwebtoken');
require('dotenv').config();

function verifyToken(req, res, next) {
  //console.log(req.headers.authorization);
  const token = req.headers.authorization.split(" ")[1];
  //console.log(token);
  if (!token) {
    return res.status(401).json({ message: 'Token not provider' });
  }

  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid Token' });
    }
    req.user = decoded;
    next();
  });
}

module.exports = { verifyToken }