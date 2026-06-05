const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  const bearerToken = token.split(' ')[1];

  jwt.verify(bearerToken, process.env.JWT_SECRET || 'recruitnova_secret', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    req.userId   = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

module.exports = { verifyToken };
