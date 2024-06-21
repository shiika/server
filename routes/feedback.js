const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");

const feedbackRoutes = (db) => {
    router.get("/all-feedback", (req, res) => {
        db.query(`SELECT * FROM Feedback`, (err, results) => {
            if (err) {
                res.status(500).json(err);
                return;
            }
            res.status(200).json(results);
        })
    });
    router.get("/feedback", (req, res) => {
        const token = req.header("authorization");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const personId = decoded.user.personId;
        db.query(`SELECT ID FROM User WHERE user_id = ?`, [personId], (err, results) => {
            const customerId = results && results[0]?.ID;
            const orderId = req.params.id;
            db.query(`SELECT * FROM Feedback WHERE user_id = ? AND orders_id = ?`, [customerId, orderId], (err, results) => {
                if (err) {
                    res.status(500).json(err);
                    return;
                }
                if (results?.length) {
                    res.status(200).json(results);
                } else {
                    res.status(200).json({msg: "No feedback found"});
                }
            })
        })
    });
    router.post("/feedback", (req, res) => {
        const orderId = req.body.orderId;
        const feedback = req.body.feedback;
        const date = formatDate(new Date());
        const token = req.header("authorization");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const personId = decoded.user.personId;
        db.query(`SELECT ID FROM User WHERE user_id = ?`, [personId], (err,results) => {
            if (err) {
                res.status(500).json(err);
                return;
            }
            if (results?.length) {
                const customerId = results[0].ID;
                db.query(`INSERT INTO Feedback (content, user_id, orders_id, feedback_date) VALUES (?, ?, ?, ?)`, [feedback, customerId, orderId, date], (err, results) => {
                    if (err) {
                        res.status(500).json(err);
                        return;
                    }
                    if (results?.affectedRows) {
                        res.status(200).json({msg: "Feedback submitted", status: res.statusCode});
                    } else {
                        res.status(500).json({msg: "Something went wrong", status: res.statusCode});
                    }
                })
            }
        })
    });

    return router
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

module.exports = feedbackRoutes;