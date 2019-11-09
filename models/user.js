const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, required: true }
});

var handleE11000 = function (error, res, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('Email already exists.'));
  } else {
    next();
  }
};

userSchema.post('save', handleE11000);

module.exports = mongoose.model("User", userSchema);
