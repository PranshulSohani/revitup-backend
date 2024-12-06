// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/product_controller');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// RESTful routes for Product resource

router.get("/get-counts", [auth, role([8])], productController.getCounts);

router.get("/get-all-products", [auth, role([7])], productController.getAllProducts); 


// POST /products - Create a new product
router.post("/create", [auth, role([8])], productController.create);            

// GET /products - Get all products
router.get("/", [auth, role([8])], productController.getAll);


// GET /products/:productId - Get a specific product by ID
router.get("/:productId", [auth, role([8])], productController.get);   




// PUT /products/:productId - Update a specific product by ID
router.put("/:productId", [auth, role([8])], productController.update);   

// DELETE /products/:productId - Delete a specific product by ID
router.delete("/:productId", [auth, role([8])], productController.delete);

module.exports = router;

