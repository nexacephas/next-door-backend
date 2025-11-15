import Course from '../models/Course.js';

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Server error while fetching courses' });
  }
};

// @desc    Get a single course by ID
// @route   GET /api/courses/:id
// @access  Public
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ message: 'Server error while fetching course' });
  }
};

// @desc    Create a new course
// @route   POST /api/courses
// @access  Admin
export const createCourse = async (req, res) => {
  try {
    const {
      title,
      category,
      price,
      level,
      instructor,
      description,
      duration,
      imageUrl,
      videoUrl
    } = req.body;

    const course = new Course({
      title,
      category,
      price,
      level: level || 'Beginner',
      instructor,
      description,
      duration,
      imageUrl: req.files?.image ? `/uploads/courses/${req.files.image[0].filename}` : imageUrl || '',
      videoUrl: videoUrl || '',
      pdfUrl: req.files?.pdf ? `/uploads/courses/${req.files.pdf[0].filename}` : '',
      quizUrl: req.files?.quiz ? `/uploads/courses/${req.files.quiz[0].filename}` : ''
    });

    await course.save();
    res.status(201).json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Server error while creating course', detail: error.message });
  }
};


// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Admin
export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const { title, category, price, level, instructor, description, duration, imageUrl, videoUrl } = req.body;

    course.title = title || course.title;
    course.category = category || course.category;
    course.price = price || course.price;
    course.level = level || course.level;
    course.instructor = instructor || course.instructor;
    course.description = description || course.description;
    course.duration = duration || course.duration;
    course.videoUrl = videoUrl || course.videoUrl;
    course.imageUrl = req.files?.image ? `/uploads/courses/${req.files.image[0].filename}` : imageUrl || course.imageUrl;
    course.pdfUrl = req.files?.pdf ? `/uploads/courses/${req.files.pdf[0].filename}` : course.pdfUrl;
    course.quizUrl = req.files?.quiz ? `/uploads/courses/${req.files.quiz[0].filename}` : course.quizUrl;

    await course.save();
    res.json(course);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ message: 'Server error while updating course', detail: error.message });
  }
};


// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Admin
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    await course.remove();
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Server error while deleting course' });
  }
};
export const enrollStudent = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const userId = req.user._id; // req.user is set by your protect middleware

    // Prevent duplicate enrollments
    if (course.students.includes(userId)) {
      return res.status(400).json({ message: 'You are already enrolled in this course' });
    }

    course.students.push(userId); // ✅ Add student
    await course.save();

    res.status(200).json({ message: 'Successfully enrolled', studentsCount: course.students.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while enrolling' });
  }
};