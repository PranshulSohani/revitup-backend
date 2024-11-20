// Importing models
const Product = require("../../src/models/Product");

// Importing helper functions
const { sendResponse, handleError } = require('../../src/helpers/helper');

// Importing the CrudService to handle CRUD operations on models
const CrudService = require("../../src/services/CrudService");

// Importing the PaginationService to handle Pagination operations on models
const PaginationService = require("../../src/services/PaginationService");

// Creating service instances for each model to perform CRUD operations
const productService = new CrudService(Product);

// Importing validation functions
const { productValidation } = require('../../src/validators/validators');

// Create a new product
exports.create = async (req, res) => {
  const { name, category_id, stock, price, incoming, outgoing } = req.body;
  try {
    // Validate the product data
    const { error } = productValidation.validate(req.body);
    if (error) return sendResponse(res, 400, false, error.details[0].message);

    // Check if product exists
    const existingProduct = await productService.findOne({ name });
    if (existingProduct) return sendResponse(res, 400, false, "Product already exists.");

    // Create the product
    const productResp = await productService.create(req.body);
    if (!productResp || !productResp._id) return sendResponse(res, 500, false, "Failed to create product.");

    return sendResponse(res, 201, true, "Product created successfully.", productResp);
  } catch (error) {
    console.log("Error:", error);
    return handleError(error, res);
  }
};

// Get all products with pagination
exports.getAll = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const searchKey = req.query.search_key || '';
  const sort = { createdAt: -1 }; // Sort by "createdAt" in descending order

  try {

       // Add the $lookup stage to join with the Category model
       const pipeline = [
        {
          $lookup: {
            from: 'categories', // name of the Category collection
            localField: 'category_id', // field in Product schema
            foreignField: '_id', // field in Category schema
            as: 'category_details', // output field name for category details
          },
        },
        {
          $unwind: {
            path: '$category_details', // Field to unwind
          },
        },        {
          $project: {
            name: 1,
            stock: 1,
            price: 1,
            incoming: 1,
            outgoing: 1,
            createdAt: 1,
            updatedAt: 1,
            category_details: { $ifNull: ['$category_details', null] }, // Set to null if no category match
          },
        },
      ];

    const result = await PaginationService.paginate(Product,pipeline, page, limit, searchKey, sort);

    if (result) {
      return sendResponse(res, 200, true, "Data found", result);
    } else {
      return sendResponse(res, 200, false, "No products found", []);
    }
  } catch (error) {
    return handleError(error, res);
  }
};

// Get a product by ID
exports.get = async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await productService.findOne({ _id: productId });
    if (!product) return sendResponse(res, 400, false, "Product record does not exist.");

    return sendResponse(res, 200, true, "Product data found", product);
  } catch (error) {
    return handleError(error, res);
  }
};

// Update a product by ID
exports.update = async (req, res) => {
  const { name, category_id, stock, price, incoming, outgoing } = req.body;
  const { productId } = req.params;

  try {
    const response = await productService.update({ _id: productId }, { name, category_id, stock, price, incoming, outgoing });
    if (response) {
      return sendResponse(res, 200, true, "Product updated successfully", response);
    } else {
      return sendResponse(res, 404, false, "Product not found or update failed.");
    }
  } catch (error) {
    return handleError(error, res);
  }
};

// Delete a product by ID
exports.delete = async (req, res) => {
  const { productId } = req.params;
  try {
    const response = await productService.delete({ _id: productId });
    if (response) {
      return sendResponse(res, 200, true, "Product deleted successfully");
    } else {
      return sendResponse(res, 404, false, "Product not found or deletion failed.");
    }
  } catch (error) {
    return handleError(error, res);
  }
};


exports.getCounts = async (req, res) => {
  try {
    // Fetch all products from the Product collection
    const products = await productService.findAll();

    let totalStock = 0;
    let stockValue = 0;
    let reorderCount = 0;
    let outOfStockCount = 0;
    if(products.length > 0){
        products.forEach(product => {
          totalStock += product.stock; // Sum up stock
          stockValue += product.stock * product.price; // Calculate stock value
          if (product.stock <= 0) {
            outOfStockCount += 1; // Count out-of-stock products
          }
          if (product.stock <= 5) { // Reorder threshold; adjust as needed
            reorderCount += 1;
          }
        });
    }

    const result = {
      total_stocks: totalStock, // Total current stock
      stock_value: stockValue, // Total value of stock
      stock_cost: stockValue, // Assuming stock cost equals stock value
      reorder_count: reorderCount, // Count of items needing reorder
      out_of_stock_count: outOfStockCount, // Count of out-of-stock items
    };
    
    return sendResponse(res, 200, true, "Stock counts retrieved successfully", result);

  } catch (error) {
    return handleError(error, res);
  }
};
