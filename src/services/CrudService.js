class CrudService {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    const document = new this.model(data);
    return await document.save();
  }

  async insertMany(dataArray) {
    return await this.model.insertMany(dataArray);
  }

  async findOne(query) {
    return await this.model.findOne(query);
  }

  async find(query) {
    return await this.model.find(query);
  }

  async findAll() {
    return await this.model.find({});
  }

  async update(query, data, options = {}) {
    // Make sure options include 'new: true' for the updated document
    options.new = true;  // This ensures we get the updated document in the response
    return await this.model.findOneAndUpdate(query, data, options);
  }

  async delete(query) {
    return await this.model.findOneAndDelete(query);
  }

  async deleteMany(query) {
    return await this.model.deleteMany(query);
  }
}

module.exports = CrudService;
