const express = require('express');
const router = express.Router();
const handleQuery = require("../utilities/crud-query");
const OrderStatusMap = require("../enums/order-status");
const jwt = require('jsonwebtoken');

const orderRoutes = (db) => {
    // Orders CRUD
    router.get('/orders', (req, res) => {
        handleQuery(res, 'SELECT * FROM Orders');
    });
    
    router.post('/orders', (req, res) => {
        const {dishes, deliveryTime, address} = req.body;
        // Create a comma-separated list of placeholders (e.g., ?, ?, ?)
        const query = `INSERT INTO Orders (status, delivery_time, address) VALUES (?, ?, ?)`;
        const dishesIds = dishes.join(',');
        db.query(query, [OrderStatusMap.get("PENDING"), deliveryTime, address], async (err, results) => {
            if (err) {
                res.json({err});
                return
            }
            const orderId = results.insertId;
            db.query(`SELECT ID FROM Dishes WHERE ID IN (?)`, [dishesIds], (err, results) => {
                if (err) {
                    res.json({err});
                    return
                }
                if (results?.length) {
                    const availableDishes = results.map(item => item.ID);
                    for (let dish of availableDishes) {
                        const query = `INSERT INTO Orders_Dishes (orders_id, dishes_id) VALUES (?, ?)`
                        db.query(query, [orderId, +dish], (err, results) => {
                            if (err) {
                                res.json({err});
                                return
                            }
                            const token = req.header('authorization');
                            
                            try {
                                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                                personId = decoded.user.personId;
                                db.query(`SELECT ID FROM User WHERE ID = ?`, [personId], (err, results) => {
                                    if (err) {
                                        res.json({err});
                                        return
                                    }
                                    if (results?.length) {
                                        const customerId = results[0].ID;
                                        const now = new Date();
                                        const date = formatDate(now);
                                        const time = formatTime(now);
                                        db.query(`SELECT DISTINCT m.chef_id
                                            FROM Dishes d
                                            JOIN Sections s ON d.section_id = s.ID
                                            JOIN Menu m ON s.menu_id = m.ID
                                            WHERE d.ID IN (?);`, [dish], (err, results) => {
                                                if (err) {
                                                    res.json({err});
                                                    return
                                                }
                                                if (results?.length) {
                                                    const chefId = results[0]?.chef_id;
                                                    if (chefId) {
                                                        db.query(`SELECT 
                                                        o.ID AS order_id,
                                                        o.status AS order_status,
                                                        o.delivery_time AS order_delivery_time,
                                                        c.ID AS chef_id,
                                                        d.ID AS dish_id,
                                                        d.name AS dish_name,
                                                        d.price AS dish_price,
                                                        d.description AS dish_description
                                                    FROM 
                                                        Orders o
                                                    JOIN 
                                                        Orders_Dishes od ON o.ID = od.orders_id
                                                    JOIN 
                                                        Dishes d ON od.dishes_id = d.ID
                                                    JOIN 
                                                        Sections s ON d.section_id = s.ID
                                                    JOIN 
                                                        Menu m ON s.menu_id = m.ID
                                                    JOIN 
                                                        Chef c ON m.chef_id = c.ID
                                                    WHERE 
                                                        c.ID = ?;
                                                    `, [chefId], (err, results) => {
                                                        if (err) {
                                                            res.json(err);
                                                            return
                                                        }
                                                        if (results?.length) {
                                                            const ordersIds = results.map(item => item.order_id);
                                                            if (ordersIds?.length) {
                                                                db.query(`UPDATE Orders SET chef_id = ? WHERE ID IN (?)`, [chefId, ordersIds], (err, results) => {
                                                                    if (err) {
                                                                        res.json(err);
                                                                        return;
                                                                    }
                                                                    res.status(200).json({orderId})
                                                                })
                                                            }
                                                        }
                                                    })
                                                    }
                                                } else {
                                                    res.status(400).json({msg: "Something went wrong"});
                                                }
                                            })
                                    } else {
                                        res.status(400).json({msg: "Something went wrong"});
                                    }
                              })
                            } catch (err) {
                              res.status(401).json({ msg: 'Token is not valid' });
                            }
                        });
                    }
                } else {
                    res.status(400).json({msg: "Something went wrong"});
                }
            })
        });
    });
    
    router.put('/orders/:id', (req, res) => {
        const { id } = req.params;
        const { name, price, description, section_id } = req.body;
        handleQuery(res, 'UPDATE Orders SET name = ?, price = ?, description = ?, section_id = ? WHERE id = ?', [name, price, description, section_id, id]);
    });
    
    router.delete('/orders/:id', (req, res) => {
        const { id } = req.params;
        handleQuery(res, 'DELETE FROM Orders WHERE id = ?', [id]);
    });

    return router
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}

module.exports = orderRoutes;