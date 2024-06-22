const express = require('express');
const router = express.Router();
const PaymentRoleMap = require("../enums/payment-role");
const handleQuery = require("../utilities/crud-query");
const OrderStatusMap = require("../enums/order-status");
const jwt = require('jsonwebtoken');

const customerRoutes = (db) => {
    // Customer CRUD
    router.get('/customer', (req, res) => {
        handleQuery(db)(res, 'SELECT * FROM User WHERE role = "Customer"');
    });

    router.delete('/customer/:id', (req, res) => {
        const id = +req.params.id;
        db.query("SET FOREIGN_KEY_CHECKS = 0", (err, results) => {
            handleQuery(db)(res, 'DELETE FROM User WHERE ID = ?', [id]);
            db.query("SET FOREIGN_KEY_CHECKS = 1");
        })
    });

    router.post('/customer-pay', (req, res) => {
        const token = req.header('authorization');
        let { orderId, method, amountPaid, totalCost } = req.body;
        const status = "pending";
        const orderStatus = OrderStatusMap.get("PENDING");
        const paymentDate = formatDate(new Date());
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        personId = decoded.user.personId;
        db.query(`SELECT ID FROM User WHERE ID = ?`, [personId], (err, results) => {
            if (err) {
                res.status(500).json(err);
                return;
            }
            if (results?.length) {
                const customerId = results[0].ID;
                db.query(`INSERT INTO Payment (role, amount_paid, payment_date, total_cost, status, user_id, order_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [PaymentRoleMap.get(method), amountPaid, paymentDate, totalCost, status, customerId, orderId],
                (err, results) => {
                    if (err) {
                        res.status(500).json(err);
                        return
                    }
                    if (results?.insertId) {
                        const paymentId = results.insertId;
                        db.query(`UPDATE Orders SET payment_id = ?, status = ? WHERE ID = ?`, [results?.insertId, orderStatus, orderId], (err, results) => {
                            if (err) {
                                res.status(500).json(err);
                                return;
                            }
                            if (results?.affectedRows) {
                                res.status(200).json({msg: "Order paid successfully!", paymentId});
                            }
                        })
                    }
                }
            )
            }
        })
    });
    
    router.put('/customer/:id', (req, res) => {
        const { id } = req.params;
        const { role } = req.body;
        handleQuery(db)(res, 'UPDATE Sections SET role = ? WHERE id = ?', [role, id]);
    });

    return router
};

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

module.exports = customerRoutes;
