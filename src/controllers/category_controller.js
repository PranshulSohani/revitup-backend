// Importing models
const Category = require("../../src/models/Category");
const Product = require("../../src/models/Product");


// Importing helper functions
const { sendResponse, handleError } = require('../../src/helpers/helper');

// Importing the PaginationService to handle Pagination operations on models
const PaginationService = require("../../src/services/PaginationService");

// Importing the CrudService to handle CRUD operations on models
const CrudService = require("../../src/services/CrudService");

// Creating service instances for each model to perform CRUD operations
const categoryService = new CrudService(Category);
const productService = new CrudService(Product);


// Importing validation functions
const { categoryValidation } = require('../../src/validators/validators');

// Create a new category
exports.create = async (req, res) => {
  const { name } = req.body;
  try {
    // Validate the category data
    const { error } = categoryValidation.validate(req.body);
    if (error) return sendResponse(res, 400, false, error.details[0].message);

    // Check if category exists
    const existingCategory = await categoryService.findOne({ name });
    if (existingCategory) return sendResponse(res, 400, false, "Category already exists.");

    // Create the category
    const categoryResp = await categoryService.create(req.body);
    if (!categoryResp || !categoryResp._id) return sendResponse(res, 500, false, "Failed to create category.");

    return sendResponse(res, 201, true, "Category created successfully.", categoryResp);
  } catch (error) {
    console.log("Error:", error);
    return handleError(error, res);
  }
};

// Get all categories with pagination
exports.getAll = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const searchKey = req.query.search_key || '';

  try {
    const search = { name: { $regex: searchKey, $options: 'i' } }; // Case-insensitive search on the "name" field
    const sort = { createdAt: -1 }; // Sort by "createdAt" in descending order
    
    const result = await PaginationService.paginate(Category, [], page, limit, search, sort);
    

    if (result) {
      return sendResponse(res, 200, true, "Data found", result);
    } else {
      return sendResponse(res, 200, false, "No categories found", []);
    }
  } catch (error) {
    return handleError(error, res);
  }
};

// Get a category by ID
exports.get = async (req, res) => {
  const { categoryId } = req.params;
  try {
    const category = await categoryService.findOne({ _id: categoryId });
    if (!category) return sendResponse(res, 400, false, "Category record does not exist.");

    return sendResponse(res, 200, true, "Category data found", category);
  } catch (error) {
    return handleError(error, res);
  }
};

// Update a category by ID
exports.update = async (req, res) => {
  const { name } = req.body;
  const { categoryId } = req.params;

  try {
    const response = await categoryService.update({ _id: categoryId }, { name });
    if (response) {
      return sendResponse(res, 200, true, "Category updated successfully", response);
    } else {
      return sendResponse(res, 404, false, "Category not found or update failed.");
    }
  } catch (error) {
    return handleError(error, res);
  }
};

// Delete a category by ID
exports.delete = async (req, res) => {
  const { categoryId } = req.params;
  try {
    const response = await categoryService.delete({ _id: categoryId });
    if (response) {
      // Delete all products with the deleted category ID
      await productService.deleteMany({ category_id: categoryId });
      return sendResponse(res, 200, true, "Category deleted successfully");
    } else {
      return sendResponse(res, 404, false, "Category not found or deletion failed.");
    }
  } catch (error) {
    return handleError(error, res);
  }
};
