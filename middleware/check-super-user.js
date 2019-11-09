const jwt = require("jsonwebtoken");
const User = require("../models/user");

module.exports = (req, res, next) => {
  var decoded;
  try {
    const token = req.headers.authorization.split(" ")[1];
    decoded = jwt.verify(token, process.env.HASHSECRET);
  } catch (error) {
    return res.status(401).json({ message: "Authentication failed!" });
  }

  User.findById
    (decoded.id).then(user => {
      if (user.email == process.env.ADMINUSER) {
        next();
      }
      else {
        res.status(401).json({ message: "User is not Super user!" });
      }
    });
};
