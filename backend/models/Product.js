const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: [true, 'Shop reference is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    sku: {
      type: String,
      required: [true, 'Product SKU / Code is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
      default: '',
    },
    purchasePrice: {
      type: Number,
      required: [true, 'Purchase price is required'],
      min: 0,
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: 0,
    },
    currentStock: {
      type: Number,
      required: [true, 'Current stock is required'],
      min: 0,
      default: 0,
    },
    minStockLevel: {
      type: Number,
      required: [true, 'Minimum stock level is required'],
      min: 0,
      default: 5,
    },
    unit: {
      type: String,
      enum: ['kg', 'gm', 'pcs', 'pack', 'packet', 'litre', 'ml', 'box', 'bottle', 'can', 'tin', 'bag', 'carton', 'dozen', 'meter'],
      default: 'pcs',
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
    },
    supplierName: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    expiryDate: {
      type: Date,
    },
    description: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for profit per item
productSchema.virtual('profitPerItem').get(function () {
  return (this.sellingPrice || 0) - (this.purchasePrice || 0);
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function () {
  if (this.currentStock <= 0) return 'Out of Stock';
  if (this.currentStock <= this.minStockLevel) return 'Low Stock';
  return 'In Stock';
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Compound index for shop-isolated SKU uniqueness
productSchema.index({ shop: 1, sku: 1 }, { unique: true });

module.exports = mongoose.model('Product', productSchema);
