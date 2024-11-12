const mongoose = require('mongoose');

// Pagination service to handle aggregation and pagination logic
class PaginationService {
  static async paginate(model, aggregateQuery, page = 1, limit = 10) {
    console.log("model",model)
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
      return await model.aggregatePaginate(aggregateQuery, options);
    } catch (error) {
      throw new Error('Pagination failed: ' + error.message);
    }
  }
}

module.exports = PaginationService;
