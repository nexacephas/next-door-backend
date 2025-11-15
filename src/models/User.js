import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Please enter your full name"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      required: function () {
        return !this.socialProvider;
      },
    },
    socialProvider: {
      type: String,
      enum: ["google", "facebook"],
      default: null,
    },
    password: {
      type: String,
      required: function () {
        return !this.socialProvider;
      },
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    enrolledCourses: [
      {
        courseId: mongoose.Schema.Types.ObjectId,
        enrolledAt: { type: Date, default: Date.now },
        progress: { type: Number, default: 0 },
        completed: { type: Boolean, default: false },
        completedAt: Date
      }
    ],
    purchasedProducts: [
      {
        productId: mongoose.Schema.Types.ObjectId,
        purchasedAt: { type: Date, default: Date.now },
        quantity: { type: Number, default: 1 }
      }
    ],
    certificates: [
      {
        courseId: mongoose.Schema.Types.ObjectId,
        courseName: String,
        issuedAt: { type: Date, default: Date.now }
      }
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password comparison
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
