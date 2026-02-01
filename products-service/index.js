const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// In-memory database (replace with actual database in production)
let products = [
  {
    id: 1,
    name: 'Laptop Pro X1',
    description: 'High-performance laptop for professionals',
    price: 1299.99,
    category: 'Electronics',
    stock: 45,
    createdAt: new Date('2024-01-10').toISOString()
  },
  {
    id: 2,
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with precision tracking',
    price: 29.99,
    category: 'Accessories',
    stock: 150,
    createdAt: new Date('2024-01-15').toISOString()
  },
  {
    id: 3,
    name: 'USB-C Hub',
    description: '7-in-1 USB-C hub with HDMI, USB 3.0, and card reader',
    price: 49.99,
    category: 'Accessories',
    stock: 80,
    createdAt: new Date('2024-02-01').toISOString()
  },
  {
    id: 4,
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical gaming keyboard with Cherry MX switches',
    price: 159.99,
    category: 'Accessories',
    stock: 60,
    createdAt: new Date('2024-02-05').toISOString()
  },
  {
    id: 5,
    name: '4K Monitor',
    description: '27-inch 4K IPS monitor with HDR support',
    price: 399.99,
    category: 'Electronics',
    stock: 25,
    createdAt: new Date('2024-02-10').toISOString()
  }
];

let nextProductId = 6;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'products-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    totalProducts: products.length
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Products Service - Product Catalog Microservice',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      products: '/products',
      productById: '/products/:id',
      categories: '/categories',
      search: '/products/search'
    }
  });
});

// Get all products
app.get('/products', (req, res) => {
  const { category, minPrice, maxPrice, limit } = req.query;
  
  let filteredProducts = products;
  
  // Filter by category if specified
  if (category) {
    filteredProducts = filteredProducts.filter(p => 
      p.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  // Filter by price range if specified
  if (minPrice) {
    filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(minPrice));
  }
  if (maxPrice) {
    filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(maxPrice));
  }
  
  // Limit results if specified
  if (limit) {
    filteredProducts = filteredProducts.slice(0, parseInt(limit));
  }
  
  res.json({
    count: filteredProducts.length,
    products: filteredProducts
  });
});

// Get product by ID
app.get('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    return res.status(404).json({
      error: 'Product not found',
      productId: productId
    });
  }
  
  res.json(product);
});

// Search products
app.get('/search', (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({
      error: 'Search query is required',
      usage: '/search?q=laptop'
    });
  }
  
  const searchTerm = q.toLowerCase();
  const results = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm) ||
    p.description.toLowerCase().includes(searchTerm) ||
    p.category.toLowerCase().includes(searchTerm)
  );
  
  res.json({
    query: q,
    count: results.length,
    products: results
  });
});

// Get all categories
app.get('/categories', (req, res) => {
  const categories = [...new Set(products.map(p => p.category))];
  
  const categoryStats = categories.map(cat => ({
    name: cat,
    count: products.filter(p => p.category === cat).length,
    averagePrice: (
      products
        .filter(p => p.category === cat)
        .reduce((sum, p) => sum + p.price, 0) /
      products.filter(p => p.category === cat).length
    ).toFixed(2)
  }));
  
  res.json({
    count: categories.length,
    categories: categoryStats
  });
});

// Create new product
app.post('/products', (req, res) => {
  const { name, description, price, category, stock } = req.body;
  
  // Validation
  if (!name || !price || !category) {
    return res.status(400).json({
      error: 'Name, price, and category are required'
    });
  }
  
  if (price <= 0) {
    return res.status(400).json({
      error: 'Price must be greater than 0'
    });
  }
  
  const newProduct = {
    id: nextProductId++,
    name,
    description: description || '',
    price: parseFloat(price),
    category,
    stock: stock || 0,
    createdAt: new Date().toISOString()
  };
  
  products.push(newProduct);
  
  res.status(201).json({
    message: 'Product created successfully',
    product: newProduct
  });
});

// Update product
app.put('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const productIndex = products.findIndex(p => p.id === productId);
  
  if (productIndex === -1) {
    return res.status(404).json({
      error: 'Product not found',
      productId: productId
    });
  }
  
  const { name, description, price, category, stock } = req.body;
  
  // Validate price if provided
  if (price !== undefined && price <= 0) {
    return res.status(400).json({
      error: 'Price must be greater than 0'
    });
  }
  
  // Update product fields
  if (name) products[productIndex].name = name;
  if (description !== undefined) products[productIndex].description = description;
  if (price) products[productIndex].price = parseFloat(price);
  if (category) products[productIndex].category = category;
  if (stock !== undefined) products[productIndex].stock = parseInt(stock);
  products[productIndex].updatedAt = new Date().toISOString();
  
  res.json({
    message: 'Product updated successfully',
    product: products[productIndex]
  });
});

// Delete product
app.delete('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const productIndex = products.findIndex(p => p.id === productId);
  
  if (productIndex === -1) {
    return res.status(404).json({
      error: 'Product not found',
      productId: productId
    });
  }
  
  const deletedProduct = products.splice(productIndex, 1)[0];
  
  res.json({
    message: 'Product deleted successfully',
    product: deletedProduct
  });
});

// Get product statistics
app.get('/stats/products', (req, res) => {
  const stats = {
    total: products.length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0).toFixed(2),
    averagePrice: (products.reduce((sum, p) => sum + p.price, 0) / products.length).toFixed(2),
    totalStock: products.reduce((sum, p) => sum + p.stock, 0),
    byCategory: {}
  };
  
  const categories = [...new Set(products.map(p => p.category))];
  categories.forEach(cat => {
    stats.byCategory[cat] = products.filter(p => p.category === cat).length;
  });
  
  res.json(stats);
});

// Update stock
app.patch('/products/:id/stock', (req, res) => {
  const productId = parseInt(req.params.id);
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    return res.status(404).json({
      error: 'Product not found',
      productId: productId
    });
  }
  
  const { quantity } = req.body;
  
  if (quantity === undefined) {
    return res.status(400).json({
      error: 'Quantity is required'
    });
  }
  
  product.stock = parseInt(quantity);
  product.updatedAt = new Date().toISOString();
  
  res.json({
    message: 'Stock updated successfully',
    product: product
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('===========================================');
  console.log(`Products Service running on port ${PORT}`);
  console.log(`Total products in catalog: ${products.length}`);
  console.log('===========================================');
});
