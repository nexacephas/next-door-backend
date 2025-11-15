import BlogPost from '../models/Blog.js';
import { generateBlogDraft } from '../utils/aiService.js';
import sanitizeHtml from 'sanitize-html';

// Generate AI Draft
export const generateDraft = async (req, res) => {
  try {
    const { title, keywords = [] } = req.body;
    const draft = await generateBlogDraft(title, keywords);
    res.json({ draft });
  } catch (err) {
    console.error('Error generating draft:', err?.message || err);
    const safeMessage = err?.message ? `Error generating draft: ${err.message}` : 'Error generating draft';
    res.status(502).json({ message: safeMessage });
  }
};

// Create Blog Post
export const createPost = async (req, res) => {
  try {
    const { title, content, keywords, author, authorName, excerpt, image, published } = req.body;

    // Secure sanitization using sanitize-html library with safe tag allowlist
    const safeContent = sanitizeHtml(content || '', {
      allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'a', 'img', 'blockquote', 'code', 'pre'],
      allowedAttributes: {
        a: ['href', 'title'],
        img: ['src', 'alt', 'title'],
      },
      allowedIframeHostnames: [],
    });
    const safeExcerpt = sanitizeHtml(excerpt || '', { allowedTags: [], allowedAttributes: {} });

    const post = new BlogPost({ title, content: safeContent, keywords, author, authorName, excerpt: safeExcerpt, image, published });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating post' });
  }
};

// Get All Posts
export const getPosts = async (req, res) => {
  try {
    const posts = await BlogPost.find({ published: true }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching posts' });
  }
};

// Get Single Post
export const getPostById = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching post' });
  }
};

// Upload Blog Image
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const imageUrl = `/uploads/blog/${req.file.filename}`;
    res.json({ url: imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error uploading image' });
  }
};

// Update Blog Post
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, keywords, author, authorName, excerpt, image, published } = req.body;

    // Secure sanitization
    const safeContent = sanitizeHtml(content || '', {
      allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'a', 'img', 'blockquote', 'code', 'pre'],
      allowedAttributes: {
        a: ['href', 'title'],
        img: ['src', 'alt', 'title'],
      },
      allowedIframeHostnames: [],
    });
    const safeExcerpt = sanitizeHtml(excerpt || '', { allowedTags: [], allowedAttributes: {} });

    const post = await BlogPost.findByIdAndUpdate(id,
      { title, content: safeContent, keywords, author, authorName, excerpt: safeExcerpt, image, published },
      { new: true }
    );

    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating post' });
  }
};

// Delete Blog Post
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await BlogPost.findByIdAndDelete(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting post' });
  }
};
