const express = require("express");
const checkAuth = require("../middleware/check-auth");
const checkAdmin = require("../middleware/check-admin");
const Product = require("../models/product");

const router = express.Router();

router.post("", checkAdmin, (req, res, next) => {
  const product = new Product({
    name: req.body.name,
    unitPrice: req.body.unitPrice,
    barcode: req.body.barcode
  });
  product.save()
    .then(createdproduct => {
      res.status(201).json({
        message: "product added successfully",
        productId: createdproduct._id
      });
    })
    .catch(error => {
      res.status(500).json({
        message: "Creating product failed : " + error.message
      });
    });
});

router.get("", checkAuth, (req, res, next) => {
  Product.find()
    .then(documents => {
      res.status(200).json(documents);
    })
    .catch(error => {
      res.status(500).json({
        message: "Retrieving products failed : " + error.message
      });
    });
});

router.patch("/:id", checkAdmin, (req, res, next) => {
  const product = new Product({
    _id: req.body.serverId,
    name: req.body.name,
    unitPrice: req.body.unitPrice,
    barcode: req.body.barcode
  });
  Product
    .updateOne({ _id: req.body.serverId }, product).then(result => {
      res.status(200).json({ message: "Update successful!" });
    })
    .catch(error => {
      res.status(500).json({
        message: "Updating product failed : " + error.message
      });
    });
});

router.delete("/:id", checkAdmin, (req, res, next) => {
  Product
    .deleteOne({ _id: req.params.id }).then(result => {
      res.status(200).json({ message: "product deleted!" });
    })
    .catch(error => {
      res.status(500).json({
        message: "Deleting product failed : " + error.message
      });
    });
});

module.exports = router;
