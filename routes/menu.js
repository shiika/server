const express = require('express');
const router = express.Router();

// Menu CRUD

const menuRoutes = (db) => {
    router.get('/menus', (req, res) => {
        handleQuery(res, 'SELECT * FROM Menu');
    });
    
    router.get("/menu-data/:id", (req, res) => {
        const menuId = req.params.id;
        db.query(`SELECT 
    c.ID AS chef_id,
    c.image AS chef_image,
    c.CV AS chef_cv,
    c.description AS 'description',
    P.first_name AS first_name, P.last_name AS last_name,
    c.social_media_platforms AS chef_social_media_platforms,
    s.ID AS section_id,
    s.role AS section_name,
    d.ID AS dish_id,
    d.name AS dish_name,
    d.price AS dish_price,
    d.description AS dish_description,
    d.image AS dish_image,
    d.section_id AS dish_section_id
FROM 
    Menu m
JOIN 
    Chef c ON m.chef_id = c.ID
JOIN 
	User P ON P.ID = c.user_id
JOIN 
    Sections s ON m.ID = s.menu_id
RIGHT JOIN 
    Dishes d ON s.ID = d.section_id
WHERE c.ID = ?`, [menuId], (err, results) => {
            if (err) {
                res.status(500).json(err);
                return;
            }
            results = results.map(item => {
                if (item.dish_image) item.dish_image = item.dish_image.toString("base64");
                if (item.chef_image) item.chef_image = item.chef_image.toString("base64");
                return item
            })
            res.status(200).json(results);
        })
    })
    
    router.post('/menus', (req, res) => {
        const { name, description } = req.body;
        handleQuery(res, 'INSERT INTO Menu (name, description) VALUES (?, ?)', [name, description]);
    });
    
    router.put('/menus/:id', (req, res) => {
        const { id } = req.params;
        const { name, description } = req.body;
        handleQuery(res, 'UPDATE Menu SET name = ?, description = ? WHERE id = ?', [name, description, id]);
    });
    
    router.delete('/menus/:id', (req, res) => {
        const { id } = req.params;
        handleQuery(res, 'DELETE FROM Menu WHERE id = ?', [id]);
    });

    return router
};

module.exports = menuRoutes;