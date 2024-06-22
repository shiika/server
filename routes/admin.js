const express = require('express');
const router = express.Router();
const handleQuery = require("../utilities/crud-query");
const OrderStatusMap = require("../enums/order-status");
const jwt = require('jsonwebtoken');

const adminRoutes = (db) => {
    
    router.post('/approve-order', (req, res) => {
        const { orderId } = req.body;
        db.query("SELECT status FROM Orders WHERE ID = ?", [orderId], (err, results) => {
            if (err) {
                res.json(err);
                return
            }
            if (results?.length) {
                const status = results[0].status;
                if (status === OrderStatusMap.get("PENDING")) {
                    res.json({msg: "Order is still being prepared", status: 400});
                    return;
                } else {
                    db.query(`UPDATE Orders SET status = ? WHERE ID = ?`, [OrderStatusMap.get("APPROVED"), orderId], (err, results) => {
                        if (err) {
                            res.json(err);
                            return;
                        } else {
                            if (results?.affectedRows) {
                                res.json({msg: "Order has been approved successfully"});
                            }
                        }
                    })
                }
            }
        })
    });
    
    router.delete('/admin/:id', (req, res) => {
        const { id } = req.params;
        db.query('DELETE FROM Users WHERE ID = ?', [id], (err, results) => {
            if (err) {
                res.status(500).json({msg: "Something went wrong"});
                return
            }
            res.status(200).json({msg: "Customer has been deleted"});
        })
    });

    router.put("/admin/:id", (req, res) => {
        const { id } = req.params;
        const {email, phone, address} = req.body;
        db.query('UPDATE Users SET email = ?, phone_number = ?, address = ? WHERE ID = ?', [email, phone, address, id], (err, results) => {
            if (err) {
                res.status(500).json({msg: "Something went wrong"});
                return
            }
            res.status(200).json({msg: "Customer has been updated"});
        })
    })

    return router
};

module.exports = adminRoutes;
