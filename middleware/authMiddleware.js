const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware-ka loo isticmaalo in la verify gareeyo JWT token-ka
// Waa inuu user-ka noqdaa authenticated si uu u helo API endpoints-ka
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Haddii token-ka ay ku jiraan headers-ka
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Haddii token-ka aan la helin
    if (!token) {
      return res.status(401).json({
        message: 'Ma aadan xaq u leh inaad soo gasho endpoint-kaan. Token-ka waa lagama maarmaan.'
      });
    }

    try {
      // Verify garee token-ka
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Soo hel user-ka token-ka ka soo baxay
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({
          message: 'User-kaan ma heli karo'
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        message: 'Token-ka waa invalid ama waa dhacay'
      });
    }
  } catch (error) {
    next(error);
  }
};

// Middleware-ka loo isticmaalo in la hubiyo in user-ku yahay admin
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      message: 'Waxaad u baahan tahay inaad noqoto admin si aad u helto endpoint-kaan'
    });
  }
};
