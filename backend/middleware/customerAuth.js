
const jwt = require('jsonwebtoken');

const CUSTOMER_COOKIE = 'museum_customer_session';

function customerCookieOptions() {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
    };
}

function requireCustomer(req, res, next) {
    const token = req.cookies?.[CUSTOMER_COOKIE];

    if (!token) {
        return res.status(401).json({
            error: 'Customer login required.'
        });
    }

    try {
        const user = jwt.verify(
            token,
            process.env.JWT_SECRET,
            {
                algorithms: ['HS256'],
                audience: 'museum-customers'
            }
        );

        if (
            user.role !== 'Customer' ||
            !Number.isSafeInteger(user.visitorId) ||
            user.visitorId < 1
        ) {
            return res.status(403).json({
                error: 'Customer access required.'
            });
        }

        req.customer = user;
        next();

    } catch (error) {
        return res.status(401).json({
            error: 'Invalid or expired customer session.'
        });
    }
}

module.exports = {
    requireCustomer,
    CUSTOMER_COOKIE,
    customerCookieOptions
};
