import express from 'express';
import multer from 'multer';
import { 
  getCourses, 
  getCourseById, 
  createCourse, 
  updateCourse, 
  deleteCourse,
 enrollStudent  
} from '../controllers/courseController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/courses'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Public routes
router.get('/', getCourses);
router.get('/:id', getCourseById);

// Admin routes
const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'pdf', maxCount: 1 },
  { name: 'quiz', maxCount: 1 }
]);

router.post('/', protect, adminOnly, uploadFields, createCourse);
router.put('/:id', protect, adminOnly, uploadFields, updateCourse);
router.delete('/:id', protect, adminOnly, deleteCourse);
router.post('/:id/enroll', protect, enrollStudent);
export default router;
