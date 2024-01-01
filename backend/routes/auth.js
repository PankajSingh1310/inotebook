const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = 'heyiampankajsingh'

// ROUTE: 1 create a user using: POST "/api/auth/createUser", no login required
router.post('/createUser', [
  body('name', 'enter a valid name').isLength({ min: 3 }),
  body('email', 'enter a valid email').isEmail(),
  body('password', 'password must have atleast 5 characters').isLength({ min: 5 })
], async (req, res) => {

  let success = false;

  // if there are errors return bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }

  try {
    // check wheter the user with the given email already exist
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ success, error: "Sorry a user with this email already exists" })
    }

    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt)

    //create a new User
    user = await User.create({
      name: req.body.name,
      password: secPass,
      email: req.body.email
    });

    const data = {
      user: {
        id: user.id
      }
    }
    const authToken = jwt.sign(data, JWT_SECRET);

    // res.json(user);
    success = true;
    res.json({ success, authToken });

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }


})

// ROUTE: 2 Authenticate a user using: POST "/api/auth/login", no login required
router.post('/login', [
  body('email', 'enter a valid email').isEmail(),
  body('password', 'Password cannot be blank').exists()
], async (req, res) => {

  let success = false;
  // if there are errors return bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Please try to login with correct credentials" });
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      success = false;
      return res.status(400).json({ success, error: "Please try to login with correct credentials" });
    }

    const data = {
      user: {
        id: user.id
      }
    }
    const authToken = jwt.sign(data, JWT_SECRET);
    success = true;
    res.json({ success, authToken });

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }

})

// ROUTE: 3 getting details of logged in user using: POST "/api/auth/getuser", login required
router.post('/getuser', fetchuser, async (req, res) => {

  try {
    userID = req.user.id;
    const user = await User.findById(userID).select("-password")
    res.send(user)
  
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})

module.exports = router;