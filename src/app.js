import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import session from "express-session";
import passport from "passport";
import verifyPaymentRouter from './routes/payment.js';
import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import { configurePassport } from "./config/passport.js";
import blogRoutes from './routes/blogRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import path from "path";

dotenv.config();
connectDB();

const app = express();

// ----- FIXED CORS -----
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://next-door-frontend.vercel.app"  // <-- FIXED (no trailing slash)
  ],
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ----- Session -----
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// ----- Passport -----
configurePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

// ----- Routes -----
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/payment", verifyPaymentRouter);

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
