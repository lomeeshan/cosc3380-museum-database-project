
const express = require('express');
const db = require('../db/connection');
const { requireLogin, requireRole } = require('../middleware/auth');

const router = express.Router();

// Only Admin and Sales Staff can access gift-shop sales.
router.use(requireLogin, requireRole('Admin', 'Sales Staff'));

// GET /api/sales - Retrieve recent sales.
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT
        s.SaleID,
        s.SaleDateTime,
        s.PaymentMethod,
        s.SaleStatus,
        COALESCE(SUM(i.Quantity * i.UnitPriceAtSale), 0) AS Total
      FROM GIFTSHOP_SALE s
      LEFT JOIN GIFTSHOP_SALE_ITEM i
        ON i.SaleID = s.SaleID
      GROUP BY
        s.SaleID,
        s.SaleDateTime,
        s.PaymentMethod,
        s.SaleStatus
      ORDER BY s.SaleDateTime DESC
      LIMIT 100
    `);

    res.json(rows);
  } catch (error) {
    next(error);
  }
});

// POST /api/sales - Complete a gift-shop sale.
router.post('/', async (req, res, next) => {
  const { paymentMethod, items } = req.body || {};

  if (
    !['Cash', 'Card'].includes(paymentMethod) ||
    !Array.isArray(items) ||
    items.length < 1 ||
    items.length > 20 ||
    items.some(item =>
      !Number.isSafeInteger(Number(item.productId)) ||
      Number(item.productId) < 1 ||
      !Number.isSafeInteger(Number(item.quantity)) ||
      Number(item.quantity) < 1
    ) ||
    new Set(items.map(item => String(item.productId))).size !== items.length
  ) {
    return res.status(400).json({
      error: 'Provide a payment method and valid, unique sale items'
    });
  }

  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [sale] = await connection.execute(`
      INSERT INTO GIFTSHOP_SALE
        (EmployeeID, SaleDateTime, PaymentMethod, SaleStatus)
      VALUES (?, NOW(), ?, 'Completed')
    `, [req.user.employeeId, paymentMethod]);

    let total = 0;
    const lowStockAlerts = [];
    for (const item of items) {
      const productId = Number(item.productId);
      const quantity = Number(item.quantity);

      // Deduct stock only when enough inventory is available.
      const [updated] = await connection.execute(`
        UPDATE GIFTSHOP_PRODUCT
        SET QuantityInStock = QuantityInStock - ?
        WHERE ProductID = ?
          AND IsActive = 1
          AND QuantityInStock >= ?
      `, [quantity, productId, quantity]);

      if (updated.affectedRows !== 1) {
        const error = new Error(
          'Product unavailable or insufficient stock'
        );
        error.status = 400;
        throw error;
      }

    // Check the product after the inventory trigger executes.
      const [products] = await connection.execute(`
        SELECT ProductName, CurrentPrice, QuantityInStock, IsActive
        FROM GIFTSHOP_PRODUCT
        WHERE ProductID = ?
      `, [productId]);

      const product = products[0];
      const price = Number(product.CurrentPrice);

      // Check whether the trigger deactivated the product.
      if (Number(product.IsActive) === 0 &&
          Number(product.QuantityInStock) < 5) {
        lowStockAlerts.push({
          productName: product.ProductName,
          quantityInStock: Number(product.QuantityInStock)
        });
      }

      // Record the item purchased
      await connection.execute(`
        INSERT INTO GIFTSHOP_SALE_ITEM
          (SaleID, ProductID, Quantity, UnitPriceAtSale)
        VALUES (?, ?, ?, ?)
      `, [sale.insertId, productId, quantity, price]);

      total += price * quantity;
    }

    await connection.commit();

    res.status(201).json({
  message: 'Sale completed',
  saleId: sale.insertId,
  total: Number(total.toFixed(2)),
  lowStockAlerts
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
