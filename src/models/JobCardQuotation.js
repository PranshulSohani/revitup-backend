const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// JobCardQuotation Schema
const jobCardQuotationSchema = new Schema(
  {
    job_card_id: {
      type: Schema.Types.ObjectId,
      ref: "VehicleMaintenceLog", // Reference to MaintenanceLog model
      required: true,
    },
    product_id: {
      type: Schema.Types.ObjectId,
      ref: "Product", // Reference to Product model
      required: true,
    },
    quotaion_for: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    total_price: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function (v) {
          return v === this.price * this.quantity; // Ensure total price matches quantity * price
        },
        message: "Total price must equal price * quantity",
      },
    },
  },
  { timestamps: true } // This will add createdAt and updatedAt fields
);


// JobCardQuotation Model
const JobCardQuotation = mongoose.model("JobCardQuotation", jobCardQuotationSchema);

module.exports = JobCardQuotation;
