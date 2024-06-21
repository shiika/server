const express = require('express');
const router = express.Router();
const multer  = require('multer');
// Configure Multer to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const fileUploadRoutes = (db) => {
    router.post('/api/dish-image', upload.single('image'), (req, res) => {
        const query = 'UPDATE Dishes SET image = ? WHERE ID = ?';
        if (!req.file?.buffer || !req.body?.id) {
            res.status(400).json({msg: "Missing parameters", status: res.statusCode});
            return
        }
        db.query(query, [req.file.buffer, req.body.id], (err, results) => {
            if (err) {
                return res.status(500).send('Error uploading image.');
            }
            res.send('Image uploaded successfully.');
          });
      });
}

module.exports = fileUploadRoutes;
