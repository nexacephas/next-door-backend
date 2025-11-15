import express from 'express';
import multer from 'multer';
import path from 'path';
import { generateDraft, createPost, getPosts, getPostById, uploadImage, updatePost, deletePost } from '../controllers/blogController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure multer for blog image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/blog/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'blog-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp)$/i;
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only image files are allowed.'));
    }
  }
});

// Public routes
router.get('/', getPosts);
router.get('/:id', getPostById);

// Admin routes (protected: auth required + admin check)
router.post('/generate', protect, adminOnly, generateDraft); // generate AI draft
router.post('/', protect, adminOnly, createPost);
router.post('/upload', protect, adminOnly, upload.single('image'), uploadImage); // image upload
router.put('/:id', protect, adminOnly, updatePost); // update post
router.delete('/:id', protect, adminOnly, deletePost); // delete post

export default router;
