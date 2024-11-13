const Product = require("../../src/models/Product");
const { sendResponse, handleError } = require('../../src/helpers/helper');
const PaginationService = require("../../src/services/PaginationService");
const CrudService = require("../../src/services/CrudService");
const productService = new CrudService(Product);
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
