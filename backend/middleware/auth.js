const jwt= require('jsonwebtoken');
const User = require('../models/user');

const authenticateToken = async (req, res ,next)=>{

    const authHeader = req.headers.authorization;
     if (!authHeader) {
           return res.status(401).json({ error: 'Authorization header missing' });
      }

    const [scheme, token] = authHeader.split(' ');

    if (!token || scheme.toLowerCase() !== 'bearer') {
         return res.status(401).json({ error: 'Invalid authorization scheme or token' });
    }

    try {

    const decoded = jwt.verify(token,process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token: user not found' });
    }

    req.user=user;
    next();

        
    } catch (error) {
        if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please login again.' });
    }
    return res.status(401).json({ error: 'Authentication failed' });
        
    }
}

module.exports = { authenticateToken };


