const express = require('express');
const router = express.Router();
const handleQuery = require("../utilities/crud-query");
const jwt = require("jsonwebtoken");

const sectionsRoutes = (db) => {
    // Sections CRUD
    router.get('/sections', (req, res) => {
        db.query(`SELECT * FROM Sections`, (err, results) => {
            res.status(200).json(results);
        })
    });
    router.get('/sections/:id', (req, res) => {
        const chefId = req.params.id;
        db.query(`SELECT S.ID, S.role, S.menu_id FROM Sections S
JOIN Menu M 
ON M.ID = S.menu_id AND M.chef_id = ?;`, [chefId], (err, results) => {
            res.status(200).json(results);
        })
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
                    db.query(`SELECT * FROM Menu WHERE chef_id = ?`, [chefId], (err, results) => {
                        if (!results?.length) {
                            db.query(`INSERT INTO Menu (chef_id) VALUES(?)`, [chefId], (err, results) => {
                                if (err) {
                                    res.status(500).json(err);
                                    return;
                                }
                                if (results?.insertId) {
                                    db.query('INSERT INTO Sections (role, menu_id) VALUES (?, ?)', [role, results?.insertId], (err, results) => {
                                        console.log("from here")
                                        if (results?.insertId) res.status(200).json(results);
                                        else res.status(200).json(results);
                                    })
                                }
                                else res.status(200).json([]);
                            })
                        } else {
                            const menuId = results[0].ID;
                            console.log({menuId})
                            db.query('INSERT INTO Sections (role, menu_id) VALUES (?, ?)', [role, menuId], (err, results) => {
                                if (results?.length) res.status(200).json(results);
                                else res.status(200).json(results);
                            })
                        }
                    })
                } else {
                    res.status(401).json({msg: "Something went wrong"})
                }
            })
        } else {
            db.query('INSERT INTO Sections (role, menu_id) VALUES (?, ?)', [role, menuId], (err, results) => {
                res.json(results);
            })
        }
    });

    router.get("/sections-dishes/:id", (req, res) => {
        const chefId = req.params.id;
        db.query(`SELECT
    Sections.ID AS sectionId,
    Sections.role AS section_role,
    Dishes.ID AS ID,
    Dishes.name AS name,
    Dishes.price AS price,
    Dishes.description AS description,
    Dishes.image AS image,
    Menu.ID as menuId
FROM
    MyDatabase.Sections
    JOIN MyDatabase.Menu ON Menu.ID = Sections.menu_id AND Menu.chef_id = ?
    LEFT JOIN MyDatabase.Dishes ON Sections.ID = Dishes.section_id`,[chefId], (err, results) => {
        results = results.map(
            item => {
                if (item.image) item.image = item.image.toString("base64");
                return item
            }
        );
        res.status(200).json(results)
})
    })
    
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
