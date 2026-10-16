const jwt = require('jsonwebtoken');
const COOKIE_NAME = 'museum_session';

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  };
}

function requireLogin(req, res, next) {
  const token = req.cookies[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: 'Please log in.' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    next();
  } catch {
    res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Please log in.' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission for this action.' });
    }
    next();
  };
}

module.exports = { requireLogin, requireRole, cookieOptions, COOKIE_NAME };
