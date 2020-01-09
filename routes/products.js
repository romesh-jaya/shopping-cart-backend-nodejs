const express = require("express");
const checkAuth = require("../middleware/check-auth");
const checkAdmin = require("../middleware/check-admin");
const Product = require("../models/product");

const router = express.Router();

router.post("", checkAdmin, (req, res) => {
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

//Pass 4 query params into this method for the case of query, none for populate
router.get("", checkAuth, (req, res) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.currentPage;
  const queryString = req.query.queryString;
  const queryForNameFlag = req.query.queryForNameFlag;

  if ((pageSize < 1) || (currentPage < 0)) {
    return res.status(500).json({
      message: "Valid pagesize, page no must be specified when querying products"
    });
  }

  if (queryString) {
    if (!queryForNameFlag) {//query by barcode
      if (isNaN(queryString)) {
        return res.status(500).json({
          message: "When querying for barcode, queryString must be a number value"
        });
      }

      //Use aggregate as we need to convert barcode column to a number for query purpose and facet for obtaining count
      Product.aggregate(
        [
          { $addFields: { compareStr: { $toString: '$barcode' } } },
          { $match: { compareStr: new RegExp(queryString) } },
          {
            $facet: {
              'products': [{ $skip: pageSize * currentPage }, { $limit: pageSize }],
              'totalCount': [
                {
                  $count: 'count'
                }
              ]
            }
          }
        ]
      ).then(results => {
        res.status(200).json({
          results
        });
      }).catch(error => {
        return res.status(500).json({
          message: "Retrieving products failed (barcode query) : " + error.message
        });
      });
    }
    else {//query by name
      //Use aggregate as we need facet for obtaining count
      Product.aggregate(
        [
          { $match: { name: new RegExp(queryString, 'i') } },
          {
            $facet: {
              'products': [{ $skip: pageSize * currentPage }, { $limit: pageSize }],
              'totalCount': [
                {
                  $count: 'count'
                }
              ]
            }
          }
        ]
      ).then(results => {
        res.status(200).json({
          results
        });
      }).catch(error => {
        return res.status(500).json({
          message: "Retrieving products failed (name query) : " + error.message
        });
      });
    }
  } else {//no querystring
    //Use aggregate as we need facet for obtaining count
    Product.aggregate(
      [
        {
          $facet: {
            'products': [{ $skip: pageSize * currentPage }, { $limit: pageSize }],
            'totalCount': [
              {
                $count: 'count'
              }
            ]
          }
        }
      ]
    ).then(results => {
      res.status(200).json({
        results
      });
    }).catch(error => {
      return res.status(500).json({
        message: "Retrieving products failed (all query) : " + error.message
      });
    });
  }
});


router.get("/:id", (req, res) => {
  Product.findOne({ name: req.params.id })
    .then(product => {
      res.status(200).json({
        product: product
      });
    })
    .catch(error => {
      return res.status(500).json({
        message: "Retrieving product failed: " + error.message
      });
    });
});

router.patch("/:id", checkAdmin, (req, res) => {
  const product = new Product({
    _id: req.body.serverId,
    name: req.body.name,
    unitPrice: req.body.unitPrice,
    barcode: req.body.barcode
  });
  Product
    .updateOne({ _id: req.body.serverId }, product).then(() => {
      res.status(200).json({ message: "Update successful!" });
    })
    .catch(error => {
      res.status(500).json({
        message: "Updating product failed : " + error.message
      });
    });
});

router.delete("/:id", checkAdmin, (req, res) => {
  Product
    .deleteOne({ _id: req.params.id }).then(() => {
      res.status(200).json({ message: "product deleted!" });
    })
    .catch(error => {
      res.status(500).json({
        message: "Deleting product failed : " + error.message
      });
    });
});

module.exports = router;
