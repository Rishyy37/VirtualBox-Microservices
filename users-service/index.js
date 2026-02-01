const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// In-memory database (replace with actual database in production)
let users = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'admin',
    createdAt: new Date('2024-01-01').toISOString()
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'user',
    createdAt: new Date('2024-01-15').toISOString()
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    role: 'user',
    createdAt: new Date('2024-02-01').toISOString()
  }
];

let nextUserId = 4;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'users-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    totalUsers: users.length
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Users Service - User Management Microservice',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      users: '/users',
      userById: '/users/:id'
    }
  });
});

// Get all users
app.get('/users', (req, res) => {
  const { role, limit } = req.query;
  
  let filteredUsers = users;
  
  // Filter by role if specified
  if (role) {
    filteredUsers = filteredUsers.filter(user => user.role === role);
  }
  
  // Limit results if specified
  if (limit) {
    filteredUsers = filteredUsers.slice(0, parseInt(limit));
  }
  
  res.json({
    count: filteredUsers.length,
    users: filteredUsers
  });
});

// Get user by ID
app.get('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({
      error: 'User not found',
      userId: userId
    });
  }
  
  res.json(user);
});

// Create new user
app.post('/users', (req, res) => {
  const { name, email, role } = req.body;
  
  // Validation
  if (!name || !email) {
    return res.status(400).json({
      error: 'Name and email are required'
    });
  }
  
  // Check if email already exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(409).json({
      error: 'User with this email already exists'
    });
  }
  
  const newUser = {
    id: nextUserId++,
    name,
    email,
    role: role || 'user',
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  
  res.status(201).json({
    message: 'User created successfully',
    user: newUser
  });
});

// Update user
app.put('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({
      error: 'User not found',
      userId: userId
    });
  }
  
  const { name, email, role } = req.body;
  
  // Check if new email conflicts with existing user
  if (email && email !== users[userIndex].email) {
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({
        error: 'User with this email already exists'
      });
    }
  }
  
  // Update user fields
  if (name) users[userIndex].name = name;
  if (email) users[userIndex].email = email;
  if (role) users[userIndex].role = role;
  users[userIndex].updatedAt = new Date().toISOString();
  
  res.json({
    message: 'User updated successfully',
    user: users[userIndex]
  });
});

// Delete user
app.delete('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({
      error: 'User not found',
      userId: userId
    });
  }
  
  const deletedUser = users.splice(userIndex, 1)[0];
  
  res.json({
    message: 'User deleted successfully',
    user: deletedUser
  });
});

// Get user statistics
app.get('/stats/users', (req, res) => {
  const stats = {
    total: users.length,
    byRole: {
      admin: users.filter(u => u.role === 'admin').length,
      user: users.filter(u => u.role === 'user').length
    },
    recentUsers: users.slice(-5).reverse()
  };
  
  res.json(stats);
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
  console.log(`Users Service running on port ${PORT}`);
  console.log(`Total users in database: ${users.length}`);
  console.log('===========================================');
});
