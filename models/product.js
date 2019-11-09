const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  name: { type: String, required: true, unique: true },
  unitPrice: { type: [Number], required: true },
  barcode: { type: Number }
});

var handleE11000 = function (error, res, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('Product Name already exists.'));
  } else {
    next();
  }
};

productSchema.post('save', handleE11000);
productSchema.post('update', handleE11000);
productSchema.post('findOneAndUpdate', handleE11000);

module.exports = mongoose.model('Product', productSchema);
