const Product = require("../models/Product");
const { route } = require("./auth");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();

//CREATE PRODUCT

router.post("/", verifyTokenAndAdmin, async (req, res) => {
  const newProduct = new Product(req.body);

  try {
    const savedProduct = await newProduct.save();
    res.status(200).json(savedProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

//UPDATE PRODUCT
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE PRODUCT
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json("Product has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET PRODUCT
router.get("/find/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET PRODUCTS BY CATEGORY

router.get("/category/:cat", async (req, res) => {
  const category = req.params.category;
  try {
    const products = await Product.find({ categories: { $in: [category] } });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json(err);
  }
});

//GET ALL PRODUCTS
router.get("/", async (req, res) => {
  const qNew = req.query.new;
  const qCategory = req.query.category;
  try {
    let products;
    let count;

    if (qNew) {
      products = await Product.find().sort({ createdAt: -1 }).limit(1);
      count = await Product.countDocuments();
    } else if (qCategory) {
      products = await Product.find({
        categories: {
          $in: [qCategory],
        },
      });
      count = await Product.countDocuments({
        categories: {
          $in: [qCategory],
        },
      });
    } else {
      products = await Product.find();
      count = await Product.countDocuments();
    }

    res.status(200).json({ count, products }); // Send count and products as JSON
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
