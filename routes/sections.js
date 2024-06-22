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
                                    handleQuery(db)(res, 'INSERT INTO Sections (role, menu_id) VALUES (?, ?)', [role, results?.insertId]);
                                }
                            })
                        } else {
                            const menuId = results[0].ID;
                            handleQuery(db)(res, 'INSERT INTO Sections (role, menu_id) VALUES (?, ?)', [role, menuId]);
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

    router.get("/sections-dishes/:id", (req, res) => {
        const chefId = req.params.id;
        db.query(`SELECT *, D.ID as ID, S.ID as sectionId, M.ID as menuId FROM Dishes D
JOIN Menu M
JOIN Sections S
ON D.section_id = S.ID AND M.chef_id = ?`,[chefId], (err, results) => {
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
