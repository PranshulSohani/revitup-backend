const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  stock: { type: Number,required: true, default: 0 },
  price: { type: Number, required: true },
  incoming: { type: Number, default: 0 },
  outgoing: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
