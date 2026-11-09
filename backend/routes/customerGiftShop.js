
const express = require('express');
const db = require('../db/connection');
const { requireCustomer } = require('../middleware/customerAuth');

const router = express.Router();

// All routes require a logged-in customer
router.use(requireCustomer);

// Confirm the customer's account is still active
router.use(async (req, res, next) => {
    try {
        const [accounts] = await db.execute(
            `SELECT a.VisitorID
             FROM CUSTOMER_ACCOUNT a
             JOIN USER_ROLE r ON a.RoleID = r.RoleID
             WHERE a.VisitorID = ?
               AND a.AccountStatus = 'Active'
               AND r.RoleName = 'Customer'
             LIMIT 1`,
            [req.customer.visitorId]
        );

        if (accounts.length === 0) {
            return res.status(403).json({
                error: 'Customer account is not active.'
            });
        }

        next();
    } catch (error) {
        next(error);
    }
});

// GET /api/customer/giftshop/products
// Show products customers can currently purchase
router.get('/products', async (req, res, next) => {
    try {
        const [products] = await db.query(`
            SELECT
                ProductID,
                ProductName,
                Category,
                CurrentPrice,
                QuantityInStock
            FROM GIFTSHOP_PRODUCT
            WHERE IsActive = 1
              OR QuantityInStock = 0
            ORDER BY ProductName
        `);

        res.json(products);
    } catch (error) {
        next(error);
    }
});

// POST /api/customer/giftshop/purchase
// Create a demo customer purchase.
router.post('/purchase', async (req, res, next) => {
    const { productId, quantity } = req.body || {};

    const selectedProduct = Number(productId);
    const selectedQuantity = Number(quantity);

    if (
        !Number.isSafeInteger(selectedProduct) ||
        selectedProduct < 1 ||
        !Number.isSafeInteger(selectedQuantity) ||
        selectedQuantity < 1 ||
        selectedQuantity > 20
    ) {
        return res.status(400).json({
            error: 'Select a valid product and quantity (1-20).'
        });
    }

    let connection;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // Deduct inventory only if enough stock exists
        const [updated] = await connection.execute(
            `UPDATE GIFTSHOP_PRODUCT
             SET QuantityInStock = QuantityInStock - ?
             WHERE ProductID = ?
               AND IsActive = 1
               AND QuantityInStock >= ?`,
            [selectedQuantity, selectedProduct, selectedQuantity]
        );

        if (updated.affectedRows !== 1) {
            const error = new Error(
                'Product unavailable or insufficient stock.'
            );
            error.status = 409;
            throw error;
        }

        // The MySQL trigger
        const [products] = await connection.execute(
            `SELECT
                ProductName,
                CurrentPrice,
                QuantityInStock,
                IsActive
             FROM GIFTSHOP_PRODUCT
             WHERE ProductID = ?`,
            [selectedProduct]
        );

        const product = products[0];
        const price = Number(product.CurrentPrice);

        // VisitorID identifies the logged-in customer
        // PaymentMethod = Demo means no real payment occurs
        const [sale] = await connection.execute(
            `INSERT INTO GIFTSHOP_SALE
                (VisitorID, SaleDateTime,
                 PaymentMethod, SaleStatus)
             VALUES (?, NOW(), 'Demo', 'Completed')`,
            [req.customer.visitorId]
        );

        await connection.execute(
            `INSERT INTO GIFTSHOP_SALE_ITEM
                (SaleID, ProductID, Quantity, UnitPriceAtSale)
             VALUES (?, ?, ?, ?)`,
            [sale.insertId, selectedProduct, selectedQuantity, price]
        );

        await connection.commit();

        res.status(201).json({
            message: 'Demo purchase completed. No payment processed.',
            saleId: sale.insertId,
            productName: product.ProductName,
            quantity: selectedQuantity,
            total: Number((price * selectedQuantity).toFixed(2)),
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        next(error);

    } finally {
        if (connection) {
            connection.release();
        }
    }
});

module.exports = router;
