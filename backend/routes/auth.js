const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { rateLimit } = require('express-rate-limit');
const db = require('../db/connection');
const { requireLogin, COOKIE_NAME, cookieOptions } = require('../middleware/Auth');
const router = express.Router();

const loginLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20,
  standardHeaders: 'draft-7', legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again later.' } });

router.post('/login', loginLimit, async (req, res, next) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string' ||
      !username.trim() || !password || username.length > 50) {
    return res.status(400).json({ error: 'Enter a username and password.' });
  }
  try {
    const [rows] = await db.execute(
      `SELECT a.EmployeeID, a.PasswordHash, a.AccountStatus,
              e.EmploymentStatus, e.FirstName, r.RoleName
       FROM EMPLOYEE_ACCOUNT a
       JOIN EMPLOYEE e ON e.EmployeeID = a.EmployeeID
       JOIN USER_ROLE r ON r.RoleID = a.RoleID
       WHERE a.Username = ?`, [username.trim()]);
    const a = rows[0];
    const valid = a && await bcrypt.compare(password, a.PasswordHash);
    if (!valid || a.AccountStatus !== 'Active' || a.EmploymentStatus !== 'Active') {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }
    const user = { employeeId: a.EmployeeID, firstName: a.FirstName, role: a.RoleName };
    const token = jwt.sign(user, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '8h' });
    res.cookie(COOKIE_NAME, token, { ...cookieOptions(), maxAge: 8 * 60 * 60 * 1000 });
    res.json({ message: 'Login successful', user });
  } catch (e) { next(e); }
});

router.get('/me', requireLogin, (req, res) => res.json({ user: req.user }));
router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions());
  res.json({ message: 'Logged out' });
});
module.exports = router;
