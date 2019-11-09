const express = require("express");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const checkSuper = require("../middleware/check-super-user");

const User = require("../models/user");

const router = express.Router();

router.post("/signup", (req, res, next) => {
  bcryptjs.hash(req.body.password, 10).then(hash => {
    const user = new User({
      email: req.body.email,
      password: hash,
      isAdmin: false
    });
    user
      .save()
      .then(result => {
        const token = jwt.sign(
          { id: user._id },
          process.env.HASHSECRET,
          { expiresIn: process.env.TOKENEXPIRATION }
        );
        const refreshToken = jwt.sign(
          { id: user._id },
          process.env.REFRESHSECRET,
          { expiresIn: process.env.REFRESHTOKENEXPIRATION }
        );
        res.status(201).json({
          message: "User created!",
          token: token,
          isAdmin: false,
          refreshToken: refreshToken
        });
      })
      .catch(error => {
        res.status(500).json({
          message: error.message
        });
      });
  });
});

router.post("/login", (req, res, next) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({
          message: "Invalid credentials"
        });
      }
      fetchedUser = user;
      return bcryptjs.compare(req.body.password, user.password);
    })
    .then(result => {
      if (!result) {
        return res.status(401).json({
          message: "Invalid credentials"
        });
      }
      const token = jwt.sign(
        { id: fetchedUser._id },
        process.env.HASHSECRET,
        { expiresIn: process.env.TOKENEXPIRATION }
      );
      const refreshToken = jwt.sign(
        { id: fetchedUser._id },
        process.env.REFRESHSECRET,
        { expiresIn: process.env.REFRESHTOKENEXPIRATION }
      );
      res.status(200).json({
        token: token,
        isAdmin: fetchedUser.isAdmin,
        refreshToken: refreshToken
      });
    })
    .catch(error => {
      res.status(500).json({
        message: "Authentication failed: " + error.message
      });
    });
});



router.post("/refresh-token", (req, res, next) => {
  //note: use any error code other than 401, otherwise it will conflict with the logic in 
  //auth-interceptor in the client
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(409).json({
          message: "User doesn't exist in database anymore"
        });
      }
      try {
        jwt.verify(req.body.refreshToken, process.env.REFRESHSECRET);
        next();
      } catch (error) {
        return res.status(409).json({ message: "Refresh token invalid. Please re-login" });
      }

      const token = jwt.sign(
        { id: user._id },
        process.env.HASHSECRET,
        { expiresIn: process.env.TOKENEXPIRATION }
      );
      res.status(200).json({
        token: token,
        isAdmin: user.isAdmin
      });
    })
    .catch(error => {
      return res.status(409).json({
        message: "Authentication with refresh token failed: " + error.message
      });
    });
});


router.post("/change-password", (req, res, next) => {
  var decoded;
  try {
    const token = req.headers.authorization.split(" ")[1];
    decoded = jwt.verify(token, process.env.HASHSECRET);
  } catch (error) {
    return res.status(401).json({ message: "Authentication failed!" });
  }

  User.findById
    (decoded.id).then(fetchedUser => {
      if (!fetchedUser) {
        return res.status(401).json({ message: "Logged in User cannot be found in database!" });
      }

      bcryptjs.compare(req.body.old_password, fetchedUser.password, function (err, isMatch) {
        if (err) {
          return res.status(401).json({ message: "Error in comparing passwords!" });
        }
        if (!isMatch) {
          return res.status(401).json({ message: "Entered current password is incorrect!" });
        }
      });

      bcryptjs.hash(req.body.password, 10).then(hash => {
        const user = new User({
          _id: fetchedUser._id,
          email: fetchedUser.email,
          password: hash,
          isAdmin: fetchedUser.isAdmin
        });
        User
          .updateOne({ _id: user._id }, user)
          .then(result => {
            const token = jwt.sign(
              { id: user._id },
              process.env.HASHSECRET,
              { expiresIn: process.env.TOKENEXPIRATION }
            );
            const refreshToken = jwt.sign(
              { id: fetchedUser._id },
              process.env.REFRESHSECRET,
              { expiresIn: process.env.REFRESHTOKENEXPIRATION }
            );
            res.status(201).json({
              message: "Password changed!",
              token: token,
              expiresIn: 3600,
              isAdmin: user.isAdmin,
              refreshToken: refreshToken
            });
          })
          .catch(error => {
            res.status(500).json({
              message: error.message
            });
          });
      });
    });
});


router.get("", checkSuper, (req, res, next) => {
  User.find()
    .then(documents => {
      let retArray = [];

      //prevent sending passwords
      documents.forEach(document => {
        if (document.email != process.env.ADMINUSER) {//Don't pass the admin user to the client, as we cannot change any settings related to this
          retArray.push({ _id: document._id, email: document.email, isAdmin: document.isAdmin });
        }
      })

      res.status(200).json(retArray);
    })
    .catch(error => {
      res.status(500).json({
        message: "Retrieving users failed: " + error.message
      });
    });
});

router.delete("/:id", checkSuper, (req, res, next) => {
  User.deleteOne({ _id: req.params.id }).then(result => {
    res.status(200).json({ message: "user deleted!" });
  })
    .catch(error => {
      res.status(500).json({
        message: "Deleting user failed: " + error.message
      });
    });
});

router.patch("/:id", checkSuper, (req, res, next) => {
  User.findById(req.params.id)
    .then(user => {
      if (!user) {
        return res.status(500).json({
          message: "User doesn't exist on server anymore"
        });
      }
      const userSave = new User({
        _id: user._id,
        email: user.email,
        password: user.password,
        isAdmin: req.body.isAdmin
      });
      User.updateOne({ _id: userSave._id }, userSave)
        .then(result => {
          res.status(200).json({ message: "Update successful!" });
        })
        .catch(error => {
          res.status(500).json({
            message: "Updating user failed: " + error.message
          });
        });
    })
});

module.exports = router;
