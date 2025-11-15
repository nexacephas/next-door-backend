import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    instructor: { type: String },
    description: { type: String },
    duration: { type: String },
    imageUrl: { type: String },
    videoUrl: { type: String },
        pdfUrl: { type: String },
    quizUrl: { type: String },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // ✅ Store students as array of user IDs
  },
  { timestamps: true }
);

const Course = mongoose.model('Course', courseSchema);
export default Course;
