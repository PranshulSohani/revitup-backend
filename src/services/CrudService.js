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

  async update(query, data) {
    return await this.model.findOneAndUpdate(query, data, { new: true });
  }

  async delete(query) {
    return await this.model.findOneAndDelete(query);
  }

  async deleteMany(query) {
    return await this.model.deleteMany(query);
  }
}

module.exports = CrudService;
