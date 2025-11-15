import mongoose from 'mongoose'
import dotenv from 'dotenv'
import slugify from 'slugify'
import Product from './src/models/product.js'
import Course from './src/models/course.js'

dotenv.config()
const MONGO_URI = process.env.MONGO_URI

const products = [
  {
    name: 'iPhone 14',
    category: 'Phones',
    brand: 'Apple',
    price: 8500,
    stock: 15,
    specs: ['6.7-inch display'],
    imageUrl: ''
  },
  {
    name: 'Samsung Galaxy S23',
    category: 'Phones',
    brand: 'Samsung',
    price: 7000,
    stock: 20,
    specs: ['6.1-inch display'],
    imageUrl: ''
  },
  {
    name: 'MacBook Air M2',
    category: 'Laptops',
    brand: 'Apple',
    price: 12000,
    stock: 10,
    specs: ['13-inch display', 'M2 Chip'],
    imageUrl: ''
  },
  {
    name: 'Dell XPS 13',
    category: 'Laptops',
    brand: 'Dell',
    price: 9500,
    stock: 8,
    specs: ['13.4-inch display', 'Intel i7'],
    imageUrl: ''
  }
]

const courses = [
  {
    title: 'Vue 3 Fundamentals',
    category: 'Web Development',
    price: 500,
    instructor: 'Nexa Cephas',
    description: 'Learn the basics of Vue 3, including composition API, reactivity, and components.',
    duration: '5h 30m',
    level: 'Beginner',
    students: 120,
    rating: 4.7,
    videoUrl: ''
  },
  {
    title: 'Advanced React Patterns',
    category: 'Web Development',
    price: 800,
    instructor: 'Jane Doe',
    description: 'Deep dive into React hooks, context, and state management for large-scale apps.',
    duration: '6h 45m',
    level: 'Advanced',
    students: 85,
    rating: 4.8,
    videoUrl: ''
  },
  {
    title: 'Node.js & Express API Development',
    category: 'Backend Development',
    price: 600,
    instructor: 'John Smith',
    description: 'Build RESTful APIs with Node.js and Express and connect them to MongoDB.',
    duration: '7h 0m',
    level: 'Intermediate',
    students: 95,
    rating: 4.6,
    videoUrl: ''
  },
  {
    title: 'Fullstack MERN Bootcamp',
    category: 'Fullstack Development',
    price: 1200,
    instructor: 'Alex Johnson',
    description: 'Master the MERN stack by building real-world projects from scratch.',
    duration: '12h 30m',
    level: 'Advanced',
    students: 150,
    rating: 4.9,
    videoUrl: ''
  }
]

// Add unique slugs for products
products.forEach(p => p.slug = slugify(p.name, { lower: true }))

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('MongoDB connected')

    // Delete old data
    await Product.deleteMany()
    await Course.deleteMany()
    console.log('Old products and courses removed')

    // Insert new data
    await Product.insertMany(products)
    await Course.insertMany(courses)
    console.log('Products and courses seeded successfully')

    process.exit()
  } catch (err) {
    console.error('Error seeding data:', err)
    process.exit(1)
  }
}

seedData()