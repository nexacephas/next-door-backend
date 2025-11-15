import mongoose from 'mongoose';
import slugify from 'slugify';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true, required: true }, // Add this
    category: { type: String, required: true },
    brand: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    description: { type: String },
    specs: [{ type: String }],
    imageUrl: { type: String },
  },
  { timestamps: true }
);

// Automatically generate unique slug before saving
productSchema.pre('validate', function (next) {
  if (!this.slug) {
    this.slug = `${slugify(this.name, { lower: true })}-${new mongoose.Types.ObjectId()}`;
  }
  next();
});

const Product = mongoose.model('Product', productSchema);
export default Product;
