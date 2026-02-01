const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Microservice URLs - Update these with your VM IPs
const USERS_SERVICE_URL = process.env.USERS_SERVICE_URL || 'http://192.168.56.11:3001';
const PRODUCTS_SERVICE_URL = process.env.PRODUCTS_SERVICE_URL || 'http://192.168.56.12:3002';

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'API Gateway - Microservices Architecture',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      users: '/api/users',
      products: '/api/products'
    }
  });
});

// ============================================
// USERS SERVICE ROUTES
// ============================================

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const response = await axios.get(`${USERS_SERVICE_URL}/users`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({
      error: 'Failed to fetch users',
      message: error.message
    });
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const response = await axios.get(`${USERS_SERVICE_URL}/users/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching user:', error.message);
    if (error.response && error.response.status === 404) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(500).json({
        error: 'Failed to fetch user',
        message: error.message
      });
    }
  }
});

// Create new user
app.post('/api/users', async (req, res) => {
  try {
    const response = await axios.post(`${USERS_SERVICE_URL}/users`, req.body);
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Error creating user:', error.message);
    res.status(500).json({
      error: 'Failed to create user',
      message: error.message
    });
  }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
  try {
    const response = await axios.put(`${USERS_SERVICE_URL}/users/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Error updating user:', error.message);
    if (error.response && error.response.status === 404) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(500).json({
        error: 'Failed to update user',
        message: error.message
      });
    }
  }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const response = await axios.delete(`${USERS_SERVICE_URL}/users/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error deleting user:', error.message);
    if (error.response && error.response.status === 404) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(500).json({
        error: 'Failed to delete user',
        message: error.message
      });
    }
  }
});

// ============================================
// PRODUCTS SERVICE ROUTES
// ============================================

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const response = await axios.get(`${PRODUCTS_SERVICE_URL}/products`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({
      error: 'Failed to fetch products',
      message: error.message
    });
  }
});

// Get product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const response = await axios.get(`${PRODUCTS_SERVICE_URL}/products/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching product:', error.message);
    if (error.response && error.response.status === 404) {
      res.status(404).json({ error: 'Product not found' });
    } else {
      res.status(500).json({
        error: 'Failed to fetch product',
        message: error.message
      });
    }
  }
});

// Create new product
app.post('/api/products', async (req, res) => {
  try {
    const response = await axios.post(`${PRODUCTS_SERVICE_URL}/products`, req.body);
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Error creating product:', error.message);
    res.status(500).json({
      error: 'Failed to create product',
      message: error.message
    });
  }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
  try {
    const response = await axios.put(`${PRODUCTS_SERVICE_URL}/products/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Error updating product:', error.message);
    if (error.response && error.response.status === 404) {
      res.status(404).json({ error: 'Product not found' });
    } else {
      res.status(500).json({
        error: 'Failed to update product',
        message: error.message
      });
    }
  }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const response = await axios.delete(`${PRODUCTS_SERVICE_URL}/products/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error deleting product:', error.message);
    if (error.response && error.response.status === 404) {
      res.status(404).json({ error: 'Product not found' });
    } else {
      res.status(500).json({
        error: 'Failed to delete product',
        message: error.message
      });
    }
  }
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
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Users Service: ${USERS_SERVICE_URL}`);
  console.log(`Products Service: ${PRODUCTS_SERVICE_URL}`);
  console.log('===========================================');
});
