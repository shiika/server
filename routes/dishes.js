const express = require('express');
const router = express.Router();
const handleQuery = require("../utilities/crud-query");

const dishesRoutes = (db) => {
    // Dishes CRUD
    router.get('/dishes', (req, res) => {
        handleQuery(db)(res, 'SELECT * FROM Dishes');
    });
    
    router.post('/dishes', (req, res) => {
        let { name, price, description, sectionId } = req.body;
        handleQuery(db)(res, 'INSERT INTO Dishes (price, name, description, section_id) VALUES (?, ?, ?, ?)', [price, name, description, sectionId]);
    });
    
    router.put('/dishes/:id', (req, res) => {
        const { id } = req.params;
        const { name, price, description } = req.body;
        handleQuery(db)(res, 'UPDATE Dishes SET name = ?, price = ?, description = ? WHERE ID = ?', [name, price, description, id]);
    });
    
    router.delete('/dishes/:id', (req, res) => {
        const { id } = req.params;
        db.query('DELETE FROM Dishes WHERE ID = ?', [id], (err, results) => {
            res.json(results);
        })
    });

    return router
}

module.exports = dishesRoutes;