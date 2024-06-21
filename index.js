require('dotenv').config();
var cors = require('cors')
const express = require('express'); // import express library
const db = require('./database/db');
const authRoutes = require("./routes/auth");
const sectionsRoutes = require("./routes/sections");
const dishesRoutes = require("./routes/dishes");
const ordersRoutes = require("./routes/order");
const customerRoutes = require("./routes/customer"); // import customer apis
const adminRoutes = require("./routes/admin");
const auth = require("./middlewares/auth");
const admin = require("./middlewares/admin");
const multer  = require('multer');
const chefRoutes = require('./routes/chef');
const commentRoutes = require('./routes/comment');
const menuRoutes = require('./routes/menu');
// Configure Multer to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const app = express(); // Call express library
const port = 4000;

app.use(cors())

// Middleware to parse response into JSON bodies
app.use(express.json());

// Create dish image
app.post('/api/dish-image', upload.single('image'), (req, res) => {
  const query = 'UPDATE Dishes SET image = ? WHERE ID = ?';
  db.query(query, [req.file.buffer, req.params.id], (err, results) => {
      if (err) {
          console.error('Error inserting image into database: ', err);
          return res.status(500).send('Error uploading image.');
      }
      res.send('Image uploaded successfully.');
    });
});

app.post('/api/wallet-proof/:id', upload.single('image'), (req, res) => {
  const query = 'UPDATE Payment SET proof_image = ? WHERE ID = ?';
  db.query(query, [req.file.buffer, req.params.id], (err, results) => {
      if (err) {
          console.error('Error inserting image into database: ', err);
          return res.status(500).send('Error uploading image.');
      }
      res.send('Image uploaded successfully.');
    });
});

app.get('/api/dishes', (req, res) => {
  const query = 'SELECT * FROM Dishes WHERE ID = 3';
  db.query(query, (err, results) => {
      if (err) {
          console.error('Error inserting image into database: ', err);
          return res.status(500).send('Error uploading image.');
      }
      res.send(results);
    });
});

// Upload chef CV
app.post('/api/chef-cv/:id', upload.single('file'), (req, res) => {
  const query = 'UPDATE Chef SET CV = ? WHERE ID = ?';
  db.query(query, [req.file.buffer, req.params.id], (err, results) => {
      if (err) {
          console.error('Error inserting image into database: ', err);
          return res.status(500).send('Error uploading image.');
      }
      res.send('Image uploaded successfully.');
    });
});

// Upload Chef image
app.post('/api/chef-image/:id', upload.single('image'), (req, res) => {
  console.log({param: req.params.id})
  const query = 'UPDATE Chef SET image = ? WHERE ID = 1';
  db.query(query, [req.file.buffer, req.params.id], (err, results) => {
      if (err) {
          console.error('Error inserting image into database: ', err);
          return res.status(500).send('Error uploading image.');
      }
      res.send('Image uploaded successfully.');
    });
});

// auth routes
app.use('/api/auth', authRoutes(db));

// Sections routes
app.use("/api", auth, sectionsRoutes(db));

// Chef routes
app.use("/api", auth, chefRoutes(db));

// Dishes routes
app.use("/api", auth, dishesRoutes(db));

// Orders routes
app.use("/api", auth, ordersRoutes(db));

// Menu routes
app.use("/api", auth, menuRoutes(db));


// Customer routes
app.use("/api", auth, customerRoutes(db)); // Call customer apis

// Comment routes
app.use("/api", auth, commentRoutes(db));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Admin routes
app.use("/api", auth, adminRoutes(db));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});