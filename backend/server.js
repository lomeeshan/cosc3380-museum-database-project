
require('dotenv').config();

const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const db = require('./db/connection');

const app = express();

// Check that the authentication is configured.
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error(
        'Set JWT_SECRET to a random string of at least 32 characters in .env'
    );
}

// Express configuration
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

app.disable('x-powered-by');

app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

//frontend HTML, CSS, and JavaScript files.
app.use(express.static(path.join(__dirname, '../frontend')));

//Check for whether the server can connect to MySQL.
app.get('/api/health', async (req, res) => {
    try {
        await db.query('SELECT 1');

        res.json({
            status: 'ok',
            database: 'connected'
        });
    } catch (error) {
        res.status(503).json({
            status: 'error',
            database: 'unavailable'
        });
    }
});


// API ROUTES
// Alaric's authentication routes
app.use('/api/auth', require('./routes/auth'));

// Eeshan's customer registration and authentication routes
app.use('/api/customer', require('./routes/customer'));

// Eeshan's Customer ticket purchases and history
app.use('/api/customer/tickets', require('./routes/customerTickets'));

// Eeshan's Customer gift-shop purchases
app.use('/api/customer/giftshop', require('./routes/customerGiftShop'));

// Eeshan's Curator-only artwork maintenance
app.use('/api/artworks', require('./routes/artworkMaintenance'));

// Trigger-generated notifications for museum employees
app.use('/api/notifications', require('./routes/notifications'));

// Alaric's crud routes
app.use('/api/entities', require('./routes/entities'));

// Eeshan's ticket purchase routes
app.use('/api/tickets', require('./routes/tickets'));

// Eeshan's sale routes
app.use('/api/sales', require('./routes/sales'));

// Alaric's Museum database queries
app.use('/api/queries', require('./routes/queries'));

// Alaric's Museum database reports
app.use('/api/reports', require('./routes/reports'));

// Alaric's public exhibition and artwork listings
app.use('/api/public', require('./routes/public'));

app.use('/api', (req, res) => {
    res.status(404).json({
        error: 'Unknown API endpoint'
    });
});


// ERROR HANDLING
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    // Database trigger errors
    if (err.sqlState === '45000') {
        return res.status(409).json({
            error: err.sqlMessage || 'Museum business rule violated'
        });
    }

    // Foreign key restrictions
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({
            error: 'Cannot delete this record because related records exist.'
        });
    }

    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({
            error: 'Select an existing related record.'
        });
    }

    // Duplicate records
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            error: 'This record already exists.'
        });
    }

    // Invalid database values
    if (
        err.code === 'ER_CHECK_CONSTRAINT_VIOLATED' ||
        err.code === 'ER_BAD_NULL_ERROR' ||
        err.code === 'ER_DATA_TOO_LONG' ||
        err.code === 'ER_TRUNCATED_WRONG_VALUE'
    ) {
        return res.status(400).json({
            error: 'Please check the entered values.'
        });
    }

    // Other errors
    if (err.status && err.status >= 400 && err.status < 500) {
        return res.status(err.status).json({
            error: err.message
        });
    }

    console.error('Unexpected request error', err);

    res.status(500).json({
        error: 'Unexpected server error.'
    });
});


// START SERVER
const PORT = Number(process.env.PORT || 3000);

app.listen(PORT, () => {
    console.log(`Museum server running at http://localhost:${PORT}`);
});
