import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  keywords: { type: [String], default: [] },
  author: { type: String, required: true },
  authorName: { type: String },
  excerpt: { type: String },
  image: { type: String },
  published: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('BlogPost', blogPostSchema);
