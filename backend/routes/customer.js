
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db/connection');
const jwt = require('jsonwebtoken');
const { rateLimit } = require('express-rate-limit');

const {
    requireCustomer,
    CUSTOMER_COOKIE,
    customerCookieOptions
} = require('../middleware/customerAuth');

const router = express.Router();

const loginLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
        error: 'Too many attempts. Try again later.'
    }
});

function createCustomerSession(res, visitorId) {
    const token = jwt.sign(
        {
            visitorId: Number(visitorId),
            role: 'Customer'
        },
        process.env.JWT_SECRET,
        {
            algorithm: 'HS256',
            audience: 'museum-customers',
            expiresIn: '8h'
        }
    );

    res.cookie(CUSTOMER_COOKIE, token, {
        ...customerCookieOptions(),
        maxAge: 8 * 60 * 60 * 1000
    });
}


// POST /api/customer/register
router.post('/register', async (req, res, next) => {
    const { firstName, lastName, email, password } = req.body || {};

    // Validate the submitted information
    if (
        typeof firstName !== 'string' ||
        !firstName.trim() ||
        firstName.trim().length > 80 ||
        typeof lastName !== 'string' ||
        !lastName.trim() ||
        lastName.trim().length > 80 ||
        typeof email !== 'string' ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
        email.trim().length > 254 ||
        typeof password !== 'string' ||
        password.length < 12 ||
        password.length > 128
    ) {
        return res.status(400).json({
            error: 'Enter valid details and a password of 12-128 characters.'
        });
    }

    const cleanEmail = email.trim().toLowerCase();
    let connection;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // Do not create a second visitor with an existing email
        const [existingVisitors] = await connection.execute(
            'SELECT VisitorID FROM VISITOR WHERE Email = ? LIMIT 1',
            [cleanEmail]
        );

        if (existingVisitors.length > 0) {
            await connection.rollback();
            return res.status(409).json({
                error: 'This email is already registered with the museum.'
            });
        }

        // Look up the customer role instead of hardcoding RoleID = 4
        const [roles] = await connection.execute(
            'SELECT RoleID FROM USER_ROLE WHERE RoleName = ?',
            ['Customer']
        );

        if (roles.length === 0) {
            throw new Error('Customer role is missing from the database.');
        }


        const passwordHash = await bcrypt.hash(password, 12);

        // Create the visitor record
        const [visitorResult] = await connection.execute(
            `INSERT INTO VISITOR (FirstName, LastName, Email)
             VALUES (?, ?, ?)`,
            [firstName.trim(), lastName.trim(), cleanEmail]
        );

        // Create the linked customer account
        await connection.execute(
            `INSERT INTO CUSTOMER_ACCOUNT
             (VisitorID, RoleID, Email, PasswordHash)
             VALUES (?, ?, ?, ?)`,
            [
                visitorResult.insertId,
                roles[0].RoleID,
                cleanEmail,
                passwordHash
            ]
        );

        // Both database operations must succeed together
        await connection.commit();
        createCustomerSession(res, visitorResult.insertId);

        return res.status(201).json({
            message: 'Customer account created successfully.',
            user: {
                visitorId: visitorResult.insertId,
                firstName: firstName.trim(),
                role: 'Customer'
            }
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: 'An account with this email already exists.'
            });
        }

        next(error);

    } finally {
        if (connection) {
            connection.release();
        }
    }
});


// POST /api/customer/login
router.post('/login', loginLimit, async (req, res, next) => {
    const { email, password } = req.body || {};

    if (
        typeof email !== 'string' ||
        typeof password !== 'string' ||
        !email.trim() ||
        !password
    ) {
        return res.status(400).json({
            error: 'Enter your email and password.'
        });
    }

    try {
        const [rows] = await db.execute(
            `SELECT
                a.VisitorID,
                a.PasswordHash,
                a.AccountStatus,
                v.FirstName
             FROM CUSTOMER_ACCOUNT AS a
             JOIN VISITOR AS v
                ON a.VisitorID = v.VisitorID
             JOIN USER_ROLE AS r
                ON a.RoleID = r.RoleID
             WHERE a.Email = ?
               AND r.RoleName = 'Customer'
             LIMIT 1`,
            [email.trim().toLowerCase()]
        );

        const customer = rows[0];

        const validPassword = customer &&
            await bcrypt.compare(
                password,
                customer.PasswordHash
            );

        if (
            !validPassword ||
            customer.AccountStatus !== 'Active'
        ) {
            return res.status(401).json({
                error: 'Invalid email or password.'
            });
        }

        createCustomerSession(res, customer.VisitorID);

        return res.json({
            message: 'Customer login successful.',
            user: {
                visitorId: customer.VisitorID,
                firstName: customer.FirstName,
                role: 'Customer'
            }
        });

    } catch (error) {
        next(error);
    }
});

// GET /api/customer/me
router.get('/me', requireCustomer, async (req, res, next) => {
    try {
        const [rows] = await db.execute(
            `SELECT
                v.VisitorID,
                v.FirstName,
                v.LastName,
                v.Email
             FROM VISITOR AS v
             JOIN CUSTOMER_ACCOUNT AS a
                ON v.VisitorID = a.VisitorID
             WHERE v.VisitorID = ?
               AND a.AccountStatus = 'Active'`,
            [req.customer.visitorId]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                error: 'Customer account unavailable.'
            });
        }

        res.json({
            user: {
                ...rows[0],
                role: 'Customer'
            }
        });

    } catch (error) {
        next(error);
    }
});

// POST /api/customer/logout
router.post('/logout', (req, res) => {
    res.clearCookie(
        CUSTOMER_COOKIE,
        customerCookieOptions()
    );

    res.json({
        message: 'Customer logged out.'
    });
});

module.exports = router;
