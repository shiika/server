const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const OrderStatusMap = require("../enums/order-status");

const chefRoutes = (db) => {
    // Chef CRUD
    router.get("/chef/prepare-order", (req, res) => {
        const orderId = req.body.orderId;
        if (!orderId) {
            res.status(400).json({ msg: "Order ID is required" });
            return;
        }
        const token = req.header("authorization");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        personId = decoded.user.personId;
        db.query(`SELECT ID FROM Chef C WHERE user_id = ?`, [personId], (err, results) => {
            if (err) {
                res.status(500).json(err);
                return
            }
            if (results?.length) {
                const chefId = results[0].ID;
                const status = OrderStatusMap.get("BEING_PREPARED");
                db.query(`UPDATE Orders SET status = ? WHERE ID = ? AND chef_id = ?`, [status, orderId, chefId], (err, results) => {
                    if (err) {
                        res.status(500).json(err);
                    }
                    if (results?.affectedRows) {
                        res.status(200).json({ msg: "Order is being prepared", status: res.statusCode });
                    }
                })
            }
        })
    });

    router.get("/home-chefs", (req, res) => {
        db.query(`SELECT first_name, last_name, description, image, C.ID FROM User P
                    JOIN Chef C
                    ON P.ID = C.user_id;`, (err, results) => {
            if (err) {
                res.status(500).json(err);
                return;
            }
            results = results.map(item => {
                if (item.image) item.image = item.image.toString("base64");
                return item
            })
            res.status(200).json(results);
        })
    });

    router.get("/chefs/:id", (req, res) => {
        const id = req.params.id;
        db.query(`SELECT * FROM User U
JOIN Chef C
ON U.ID = C.user_id AND U.role = 'Chef'
WHERE U.ID = ?`, [id], (err, results) => {
            if (err) {
                res.status(500).json({msg: "seomthin"});
                return;
            }
            if (results) {
                const chefs = results.map(item => {
                    item.name = `${item.first_name} ${item.last_name}`;
                    item.phone = item.phone_number;
                    if (item.image) item.image = item.image.toString("base64");
                    if (item.CV) item.CV = item.CV.toString("base64");
                })
                res.status(200).json(results);
            }
        })
    })
    router.get("/chefs", (req, res) => {
        db.query(`SELECT * FROM User U
JOIN Chef C
ON U.ID = C.user_id AND U.role = 'Chef'`, (err, results) => {
            if (err) {
                res.status(500).json({msg: "seomthin"});
                return;
            }
            if (results) {
                const chefs = results.map(item => {
                    item.name = `${item.first_name} ${item.last_name}`;
                    item.phone = item.phone_number;
                    if (item.image) item.image = item.image.toString("base64");
                    if (item.CV) item.CV = item.CV.toString("base64");
                })
                res.status(200).json(results);
            }
        })
    })

    router.delete("/chefs/:id", (req, res) => {
        const id = req.params.id;
        const token = req.header("authorization");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const personId = decoded.user.personId;
        db.query("SET FOREIGN_KEY_CHECKS = 0", (err, results) => {
            db.query("DELETE FROM Chef WHERE ID = ?", [id], (err, results) => {
                db.query("DELETE FROM User WHERE ID = ?", [personId], (err, results) => {
                    db.query("SET FOREIGN_KEY_CHECKS = 1", (err, results) => {
                        res.status(200).json("Chef has been removed")
                    })
                })
            })
        })
    })
    return router
}

module.exports = chefRoutes;
