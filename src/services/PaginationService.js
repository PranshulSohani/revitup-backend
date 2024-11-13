const mongoose = require('mongoose');

class PaginationService {
  /**
   * Paginate with optional search and sort functionality
   * @param {mongoose.Model} model - The Mongoose model to paginate
   * @param {Array} aggregateStages - Initial aggregation stages like match or filter stages
   * @param {Number} page - Page number
   * @param {Number} limit - Documents per page
   * @param {Object} [search] - Search criteria
   * @param {Object} [sort] - Sort criteria
   * @returns {Object} Paginated result
   */
  static async paginate(model, aggregateStages = [], page = 1, limit = 10, search = {}, sort = { createdAt: -1 }) {
    // Apply search criteria if provided
    if (Object.keys(search).length) {
      aggregateStages.push({ $match: search });
    }

    // Apply sort criteria
    aggregateStages.push({ $sort: sort });

    // Set up pagination labels and options
    const customLabels = {
      totalDocs: "totalDocs",
      docs: "data",
      limit: "limit",
      page: "page",
      nextPage: "nextPage",
      prevPage: "prevPage",
      totalPages: "totalPages",
      pagingCounter: "slNo",
      meta: "paginator",
    };

    const options = {
      page,
      limit,
      customLabels,
    };

    try {
      // Execute aggregation with pagination
      return await model.aggregatePaginate(model.aggregate(aggregateStages), options);
    } catch (error) {
      throw new Error('Pagination failed: ' + error.message);
    }
  }
}

module.exports = PaginationService;
