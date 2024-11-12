const Category = require("../../src/models/Category");
const { sendResponse, handleError } = require('../../src/helpers/helper');
const PaginationService = require("../../src/services/PaginationService");
const CrudService = require("../../src/services/CrudService");
const categoryService = new CrudService(Category);
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

  try {
    const aggregateQuery = Category.aggregate([{ $sort: { createdAt: -1 } }]); // Sort categories by creation date
    const result = await PaginationService.paginate(Category, aggregateQuery, page, limit);

    if (result) {
      return sendResponse(res, 200, true, "Success", result);
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
      return sendResponse(res, 200, true, "Category deleted successfully");
    } else {
      return sendResponse(res, 404, false, "Category not found or deletion failed.");
    }
  } catch (error) {
    return handleError(error, res);
  }
};
