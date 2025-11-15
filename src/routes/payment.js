import express from 'express';
import fetch from 'node-fetch';
import sendEmail from '../utils/sendEmail.js';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Order from '../models/Order.js';

const router = express.Router();

router.post('/api/verify-payment', protect, async (req, res) => {
  const { reference, items } = req.body;

  if (!reference) return res.status(400).json({ status: 'error', message: 'Reference is required' });

  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    // If secret key missing or is a public key, allow a developer test-mode when explicitly enabled.
    const allowTest = process.env.ALLOW_PAYSTACK_TEST_MODE === 'true';
    if (!secretKey || secretKey.startsWith('pk_')) {
      if (!allowTest) {
        if (!secretKey) return res.status(500).json({ status: 'error', message: 'PAYSTACK_SECRET_KEY not configured on server' });
        return res.status(500).json({ status: 'error', message: 'PAYSTACK_SECRET_KEY appears to be a public key (pk_...). Please set your Paystack secret key (sk_...) in the server .env' });
      }

      // Test mode: simulate a successful verification using optional fields from the request body.
      console.warn('PAYSTACK test mode verification used for reference:', reference);
      const mocked = {
        status: true,
        data: {
          reference,
          status: 'success',
          amount: req.body.amount ? Number(req.body.amount) * 100 : 0,
          customer: { email: req.body.email || null },
          paid_at: new Date().toISOString(),
          gateway_response: 'Test mode (simulated)'
        }
      };

      // Reuse the success handling below by setting `data` to mocked
      var data = mocked;
    } else {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${secretKey}` }
      });

      var data = await response.json();
    }

    if (data.status && data.data.status === 'success') {
      // Payment verified - process enrollment and order creation
      const tx = data.data;
      const customerEmail = tx?.customer?.email || tx?.customer_email || null;
      const userId = req.user.id;

      // Get user for enrollment
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      // Process items (enroll in courses, add products to purchase history)
      const itemsToEnroll = items || [];
      let courseIds = [];
      let totalAmount = (tx.amount || 0) / 100;

      for (const item of itemsToEnroll) {
        if (item.type === 'course') {
          // Check if already enrolled
          const alreadyEnrolled = user.enrolledCourses.some(
            e => e.courseId.toString() === item.itemId
          );
          
          if (!alreadyEnrolled) {
            user.enrolledCourses.push({
              courseId: item.itemId,
              progress: 0,
              completed: false
            });
            courseIds.push(item.itemId);
          }
        } else if (item.type === 'product') {
          // Add to purchased products
          const alreadyPurchased = user.purchasedProducts.some(
            p => p.productId.toString() === item.itemId
          );
          
          if (!alreadyPurchased) {
            user.purchasedProducts.push({
              productId: item.itemId,
              quantity: item.quantity || 1
            });
          }
        }
      }

      // Save user with enrollments
      await user.save();

      // Create order record
      const order = new Order({
        userId,
        items: itemsToEnroll,
        totalAmount,
        email: customerEmail || user.email,
        phone: user.phone,
        status: 'paid',
        paymentMethod: 'paystack',
        paymentReference: reference
      });

      await order.save();

      // Compose receipt with enrollment info
      const amount = (tx.amount || 0) / 100;
      const paidAt = tx.paid_at || tx.created_at || new Date().toISOString();
      const courseEnrollmentText = courseIds.length > 0 
        ? `<p><strong>✓ You have been enrolled in ${courseIds.length} course(s)!</strong> You can now access them in your Student Dashboard.</p>`
        : '';

      const html = `
        <h2>Payment Receipt</h2>
        <p>Thank you for your payment.</p>
        ${courseEnrollmentText}
        <ul>
          <li><strong>Amount:</strong> ₦${amount.toFixed(2)}</li>
          <li><strong>Reference:</strong> ${tx.reference}</li>
          <li><strong>Status:</strong> ${tx.status}</li>
          <li><strong>Paid At:</strong> ${paidAt}</li>
          <li><strong>Gateway:</strong> ${tx.gateway_response || tx.channel || 'Paystack'}</li>
        </ul>
        <p><strong>Next Step:</strong> Visit your <a href="http://localhost:5173/dashboard">Student Dashboard</a> to start learning!</p>
      `;

      if (customerEmail) {
        try {
          await sendEmail({
            to: customerEmail,
            subject: `Receipt & Course Enrollment — ${tx.reference}`,
            html,
          });
        } catch (e) {
          console.error('Failed to send receipt email:', e?.message || e);
        }
      }

      // Return success with enrollment info
      return res.json({ 
        status: 'success', 
        message: 'Payment verified and enrollment processed',
        enrolledCourses: courseIds.length,
        data: data.data 
      });
    } else {
      return res.json({ status: 'error', message: 'Payment not verified', data: data.data });
    }
  } catch (err) {
    console.error('Verify payment error:', err);
    res.status(500).json({ status: 'error', message: 'Server error verifying payment', error: err?.message || String(err) });
  }
});

export default router;
