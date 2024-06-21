const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const PersonEnum = require("../enums/person-role");
const GenderEnum = require("../enums/person-gender");

const router = express.Router();

const authRoutes = (db) => {

  // Register Route
  router.post('/register', async (req, res) => {
    const { 
        firstName,
        lastName,
        email,
        phone,
        gender,
        birthDate,
        address,
        role,
        password,
        // Chef additional columns
        socialMediaPlatform,
        description
    } = req.body;

    // Check if user exists
    db.query('SELECT * FROM User WHERE email = ?', [email], async (err, results) => {
      if (err) throw err;
      if (results.length > 0) {
        return res.status(400).json({ msg: 'User already exists', status: res.statusCode });
      }

      // Create new user
      const hashedPassword = await bcrypt.hash(password, 10);
      const PersonRole = PersonEnum.get(role);
      const personGender = GenderEnum.get(gender);
      db.query(
        'INSERT INTO User (first_name, last_name, email, phone_number, gender, birth_date, address, role, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', 
        [
          firstName,
          lastName,
          email,
          phone,
          personGender,
          birthDate,
          address,
          PersonRole,
          hashedPassword], 
        (err, results) => {
            if (err) throw err;
            if (PersonRole === PersonEnum.get("CHEF")) {
              if (results?.insertId) {
                const userId = results?.insertId;
                db.query(`INSERT INTO Chef (social_media_platforms, description, user_id) VALUES (?, ?, ?)`, [socialMediaPlatform, description, userId], (err, results) => {
                  if (err) {
                    res.json(err);
                    return
                  }
                  res.status(200).json({ msg: 'User registered' })
                })
              }
            } else res.status(200).json({ msg: 'User registered' });
        })
    });
  });

  // Login Route
  router.post('/login', (req, res) => {
    let { email, password, role } = req.body;
    role = PersonEnum.get(role);

    // Check if user exists
    db.query('SELECT * FROM User WHERE email = ? AND role = ?', [email, PersonEnum.get("CUSTOMER")], async (err, results) => {
      if (err) throw err;

      if (results.length === 0) {
        return res.status(400).json({ msg: 'Invalid credentials', status: res.statusCode });
      }

      const user = results[0];

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials', status: res.statusCode });
      }

      // Create JWT
      const payload = {
        user: {
          name: `${user.first_name} ${user.last_name}`,
          phone: user.phone_number,
          birthDate: user.birth_date,
          address: user.address,
          email: user.email,
          role: user.role,
          personId: user.ID
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1d' },
        (err, token) => {
          if (err) throw err;
          res.status(200).json({ token, status: res.statusCode });
        }
      );
    });
  });
  router.post('/admin-login', (req, res) => {
    let { email, password } = req.body;

    // Check if user exists
    db.query('SELECT * FROM MyDatabase.User WHERE email = ? AND (role = "Chef" OR role = "Admin");', [email, PersonEnum.get("CUSTOMER")], async (err, results) => {
      if (err) throw res.status(500).json({msg: "Something went wrong"});

      if (results.length === 0) {
        return res.status(400).json({ msg: 'Invalid credentials', status: res.statusCode });
      }

      const user = results[0];

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials', status: res.statusCode });
      }

      // Create JWT
      const payload = {
        user: {
          name: `${user.first_name} ${user.last_name}`,
          phone: user.phone_number,
          birthDate: user.birth_date,
          address: user.address,
          email: user.email,
          role: user.role,
          personId: user.ID,
          gender: user.gender
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1d' },
        (err, token) => {
          if (err) throw err;
          res.status(200).json({ token, status: res.statusCode });
        }
      );
    });
  });

  return router;
};

module.exports = authRoutes;