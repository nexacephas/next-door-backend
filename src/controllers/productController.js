import Product from '../models/Product.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
};

// @desc    Get a single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error while fetching product' });
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Admin
export const createProduct = async (req, res) => {
  try {
    const { name, category, brand, price, stock, description, specs } = req.body;

    // file upload handler
    const imageUrl = req.file ? `/uploads/products/${req.file.filename}` : '';

    const product = new Product({
      name,
      category,
      brand,
      price,
      stock,
      description,
      specs: specs ? specs.split(',') : [], // support comma-separated specs
      imageUrl,
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error while creating product' });
  }
};

// @desc    Update an existing product
// @route   PUT /api/products/:id
// @access  Admin
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const { name, category, brand, price, stock, description, specs } = req.body;

    // update all provided fields
    product.name = name || product.name;
    product.category = category || product.category;
    product.brand = brand || product.brand;
    product.price = price || product.price;
    product.stock = stock || product.stock;
    product.description = description || product.description;
    product.specs = specs ? specs.split(',') : product.specs;

    // update image if uploaded
    if (req.file) product.imageUrl = `/uploads/products/${req.file.filename}`;

    await product.save();
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error while updating product' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await product.remove();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error while deleting product' });
  }
};
