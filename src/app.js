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
dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Session middleware (before passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
// Mount the route
app.use(verifyPaymentRouter);
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
// Passport
app.use(passport.initialize());
app.use(passport.session());
configurePassport(); // only once

// Serve uploaded files
import path from "path";
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/courses", courseRoutes);

app.use('/api/blog', blogRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/student', studentRoutes);
// Error Handlers
app.use(notFound);
app.use(errorHandler);

export default app;
