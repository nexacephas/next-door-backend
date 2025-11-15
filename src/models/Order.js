import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [
      {
        type: {
          type: String,
          enum: ['product', 'course'],
          required: true
        },
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true
        },
        name: String,
        price: Number,
        quantity: { type: Number, default: 1 }
      }
    ],
    totalAmount: {
      type: Number,
      required: true
    },
    email: String,
    phone: String,
    address: String,
    status: {
      type: String,
      enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },
    paymentMethod: {
      type: String,
      enum: ['paystack', 'bank_transfer', 'cash_on_delivery'],
      default: 'paystack'
    },
    paymentReference: String,
    notes: String
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
