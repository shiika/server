const express = require('express');
const router = express.Router();
const handleQuery = require("../utilities/crud-query");
const jwt = require("jsonwebtoken");

const sectionsRoutes = (db) => {
    // Sections CRUD
    router.get('/sections', (req, res) => {
        handleQuery(db)(res, 'SELECT * FROM Sections');
    });
    
    router.post('/sections', (req, res) => {
        const token = req.header("authorization");
        decoded = jwt.verify(token, process.env.JWT_SECRET);
        personId = decoded.user.personId;
        let { role, menuId } = req.body;
        if (!menuId) {
            db.query(`SELECT ID FROM Chef WHERE user_id = ?`, [personId], (err, results) => {
                if (err) {
                    res.status(500).json(err);
                    return;
                }
                if (results?.length) {
                    const chefId = results[0].ID;
                    db.query(`INSERT INTO Menu (chef_id) VALUES(?)`, [chefId], (err, results) => {
                        if (err) {
                            res.status(500).json(err);
                            return;
                        }
                        if (results?.insertId) {
                            handleQuery(db)(res, 'INSERT INTO Sections (role, menu_id) VALUES (?, ?)', [role, results?.insertId]);
                        }
                    })
                } else {
                    res.status(401).json({msg: "Something went wrong"})
                }
            })
        } else {
            handleQuery(db)(res, 'INSERT INTO Sections (role, menu_id) VALUES (?, ?)', [role, menuId]);
        }
    });
    
    router.put('/sections/:id', (req, res) => {
        const { id } = req.params;
        const { role } = req.body;
        handleQuery(db)(res, 'UPDATE Sections SET role = ? WHERE ID = ?', [role, id]);
    });
    
    router.delete('/sections/:id', (req, res) => {
        const { id } = req.params;
        handleQuery(db)(res, 'DELETE FROM Sections WHERE ID = ?', [id]);
    });

    return router
};

module.exports = sectionsRoutes;
