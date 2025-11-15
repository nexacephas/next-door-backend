import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Course from '../models/Course.js';
import Product from '../models/Product.js';

const router = express.Router();

// @desc    Get student dashboard data (enrolled courses, orders, certificates)
// @route   GET /api/student/dashboard
// @access  Protected
router.get('/dashboard', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('enrolledCourses.courseId', 'title imageUrl category level duration')
      .populate('purchasedProducts.productId', 'name imageUrl category price brand');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get orders for this user
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });

    // Format enrolled courses with progress
    const enrolledCourses = user.enrolledCourses.map(enrollment => {
      const courseData = enrollment.courseId?.toObject ? enrollment.courseId.toObject() : enrollment.courseId;
      return {
        ...courseData,
        enrolledAt: enrollment.enrolledAt,
        progress: enrollment.progress,
        completed: enrollment.completed,
        completedAt: enrollment.completedAt
      };
    });

    // Format purchased products
    const purchasedProducts = user.purchasedProducts.map(purchase => {
      const productData = purchase.productId?.toObject ? purchase.productId.toObject() : purchase.productId;
      return {
        ...productData,
        purchasedAt: purchase.purchasedAt,
        quantity: purchase.quantity
      };
    });

    res.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone
      },
      enrolledCourses,
      purchasedProducts,
      orders,
      certificates: user.certificates
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ message: 'Server error', detail: err.message });
  }
});

// @desc    Enroll in a course
// @route   POST /api/student/enroll/:courseId
// @access  Protected
router.post('/enroll/:courseId', protect, async (req, res) => {
  try {
    const { courseId } = req.params;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled
    const user = await User.findById(req.user.id);
    const alreadyEnrolled = user.enrolledCourses.some(e => e.courseId.toString() === courseId);
    if (alreadyEnrolled) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Add to enrolled courses
    user.enrolledCourses.push({
      courseId,
      progress: 0,
      completed: false
    });

    await user.save();

    res.json({ message: 'Successfully enrolled in course' });
  } catch (err) {
    console.error('Enrollment error:', err);
    res.status(500).json({ message: 'Server error', detail: err.message });
  }
});

// @desc    Update course progress
// @route   PUT /api/student/course/:courseId/progress
// @access  Protected
router.put('/course/:courseId/progress', protect, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { progress, completed } = req.body;

    const user = await User.findById(req.user.id);
    const enrollment = user.enrolledCourses.find(e => e.courseId.toString() === courseId);

    if (!enrollment) {
      return res.status(404).json({ message: 'Not enrolled in this course' });
    }

    enrollment.progress = progress || enrollment.progress;
    enrollment.completed = completed || enrollment.completed;
    if (completed) {
      enrollment.completedAt = new Date();
    }

    await user.save();

    res.json({ message: 'Progress updated', enrollment });
  } catch (err) {
    console.error('Progress update error:', err);
    res.status(500).json({ message: 'Server error', detail: err.message });
  }
});

// @desc    Get user orders
// @route   GET /api/student/orders
// @access  Protected
router.get('/orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', detail: err.message });
  }
});

// @desc    Get single order
// @route   GET /api/student/orders/:orderId
// @access  Protected
router.get('/orders/:orderId', protect, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, userId: req.user.id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error', detail: err.message });
  }
});
// @desc    Enroll student after successful payment
// @route   POST /api/student/enroll-after-payment
// @access  Protected
router.post('/enroll-after-payment', protect, async (req, res) => {
  try {
    const { courseId } = req.body;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Get user
    const user = await User.findById(req.user.id);

    // Check if already enrolled
    const alreadyEnrolled = user.enrolledCourses.some(e => e.courseId.toString() === courseId);
    if (alreadyEnrolled) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Enroll user
    user.enrolledCourses.push({
      courseId,
      progress: 0,
      completed: false
    });

    await user.save();

    res.json({ message: 'Enrollment successful', course });
  } catch (err) {
    console.error('Enrollment after payment error:', err);
    res.status(500).json({ message: 'Server error', detail: err.message });
  }
});


export default router;
