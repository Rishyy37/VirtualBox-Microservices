# VirtualBox Microservices Project

A complete microservices architecture deployed across multiple VirtualBox virtual machines, demonstrating distributed system design and inter-VM communication.

## 📋 Project Overview

This project implements a microservices-based application consisting of:
- **API Gateway** (VM1): Routes client requests to appropriate microservices
- **Users Service** (VM2): Manages user data and authentication
- **Products Service** (VM3): Handles product catalog and inventory

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Host Machine                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Host-Only Network: 192.168.56.0/24           │   │
│  │                                                       │   │
│  │  ┌──────────┐    ┌──────────┐    ┌──────────┐      │   │
│  │  │   VM1    │    │   VM2    │    │   VM3    │      │   │
│  │  │ Gateway  │◄──►│  Users   │◄──►│ Products │      │   │
│  │  │  :3000   │    │  :3001   │    │  :3002   │      │   │
│  │  └──────────┘    └──────────┘    └──────────┘      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Technology Stack

- **Virtualization**: Oracle VirtualBox 7.0+
- **Operating System**: Ubuntu Server 22.04 LTS
- **Runtime**: Node.js 20.x LTS
- **Framework**: Express.js 4.18
- **Process Manager**: PM2
- **HTTP Client**: Axios (for inter-service communication)

## 📦 VM Configuration

### VM1 - API Gateway
- **IP Address**: 192.168.56.10
- **Port**: 3000
- **RAM**: 2GB
- **CPU**: 2 cores
- **Role**: Routes requests, load balancing, API aggregation

### VM2 - Users Service
- **IP Address**: 192.168.56.11
- **Port**: 3001
- **RAM**: 2GB
- **CPU**: 2 cores
- **Role**: User management, CRUD operations

### VM3 - Products Service
- **IP Address**: 192.168.56.12
- **Port**: 3002
- **RAM**: 2GB
- **CPU**: 2 cores
- **Role**: Product catalog, inventory management

## 🚀 Quick Start

### Prerequisites
1. VirtualBox 7.0+ installed
2. Ubuntu Server 22.04 LTS ISO downloaded
3. At least 8GB RAM and 50GB free disk space
4. Git installed on all VMs

### Installation Steps

#### 1. Create and Configure VMs
```bash
# Follow the step-by-step guide in the documentation
# Create 3 VMs with Host-Only networking enabled
```

#### 2. Configure Network
On each VM, configure static IP:
```bash
sudo nano /etc/netplan/00-installer-config.yaml
```

VM1 configuration:
```yaml
network:
  version: 2
  ethernets:
    enp0s3:
      dhcp4: true
    enp0s8:
      addresses:
        - 192.168.56.10/24
```

Apply configuration:
```bash
sudo netplan apply
```

Repeat for VM2 (192.168.56.11) and VM3 (192.168.56.12).

#### 3. Install Node.js on All VMs
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

#### 4. Deploy Services

**On VM1 (Gateway):**
```bash
git clone <your-repository-url>
cd virtualbox-microservices/gateway
npm install
sudo npm install -g pm2
pm2 start index.js --name gateway
pm2 save
pm2 startup
```

**On VM2 (Users Service):**
```bash
git clone <your-repository-url>
cd virtualbox-microservices/users-service
npm install
sudo npm install -g pm2
pm2 start index.js --name users-service
pm2 save
pm2 startup
```

**On VM3 (Products Service):**
```bash
git clone <your-repository-url>
cd virtualbox-microservices/products-service
npm install
sudo npm install -g pm2
pm2 start index.js --name products-service
pm2 save
pm2 startup
```

## 🧪 Testing the System

### Health Checks
```bash
# Test Gateway
curl http://192.168.56.10:3000/health

# Test Users Service
curl http://192.168.56.11:3001/health

# Test Products Service
curl http://192.168.56.12:3002/health
```

### API Endpoints

#### Gateway Endpoints
```bash
# Get all users (through gateway)
curl http://192.168.56.10:3000/api/users

# Get all products (through gateway)
curl http://192.168.56.10:3000/api/products

# Create a user
curl -X POST http://192.168.56.10:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice Johnson","email":"alice@example.com"}'

# Create a product
curl -X POST http://192.168.56.10:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Gaming Mouse","price":79.99,"category":"Accessories","stock":100}'
```

#### Direct Service Endpoints

**Users Service:**
```bash
# Get all users
curl http://192.168.56.11:3001/users

# Get user by ID
curl http://192.168.56.11:3001/users/1

# Update user
curl -X PUT http://192.168.56.11:3001/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"John Updated","role":"admin"}'

# Delete user
curl -X DELETE http://192.168.56.11:3001/users/1

# Get user statistics
curl http://192.168.56.11:3001/stats/users
```

**Products Service:**
```bash
# Get all products
curl http://192.168.56.12:3002/products

# Get product by ID
curl http://192.168.56.12:3002/products/1

# Search products
curl http://192.168.56.12:3002/search?q=laptop

# Get categories
curl http://192.168.56.12:3002/categories

# Update product stock
curl -X PATCH http://192.168.56.12:3002/products/1/stock \
  -H "Content-Type: application/json" \
  -d '{"quantity":75}'
```

## 📊 Monitoring

### Check Service Status
```bash
# On each VM
pm2 status
pm2 logs
pm2 monit
```

### View Logs
```bash
# Real-time logs
pm2 logs gateway

# Specific service logs
pm2 logs users-service --lines 100
```

## 🔧 Troubleshooting

### Network Issues
```bash
# Check IP configuration
ip a

# Test connectivity between VMs
ping 192.168.56.10
ping 192.168.56.11
ping 192.168.56.12

# Check if service is listening
netstat -tulpn | grep :3000
```

### Service Issues
```bash
# Restart service
pm2 restart gateway

# Stop and start
pm2 stop gateway
pm2 start gateway

# View detailed logs
pm2 logs gateway --err
```

### Firewall Issues
```bash
# Check firewall status
sudo ufw status

# Temporarily disable (for testing only)
sudo ufw disable

# Allow specific ports
sudo ufw allow 3000
sudo ufw allow 3001
sudo ufw allow 3002
```

## 📁 Project Structure

```
virtualbox-microservices/
├── gateway/
│   ├── index.js           # API Gateway implementation
│   └── package.json       # Dependencies
├── users-service/
│   ├── index.js           # Users service implementation
│   └── package.json       # Dependencies
├── products-service/
│   ├── index.js           # Products service implementation
│   └── package.json       # Dependencies
└── README.md              # This file
```

## 🔐 Security Considerations

- Services bind to `0.0.0.0` to accept connections from other VMs
- In production, implement:
  - Authentication and authorization (JWT, OAuth2)
  - HTTPS/TLS encryption
  - Rate limiting
  - Input validation and sanitization
  - Firewall rules (allow only necessary ports)
  - Regular security updates

## 🚀 Future Enhancements

- [ ] Add database (MongoDB/PostgreSQL) on dedicated VM
- [ ] Implement service discovery (Consul/etcd)
- [ ] Add message queue (RabbitMQ/Redis)
- [ ] Implement centralized logging (ELK stack)
- [ ] Add monitoring (Prometheus + Grafana)
- [ ] Containerize with Docker
- [ ] Implement CI/CD pipeline
- [ ] Add load balancing (Nginx)
- [ ] Implement caching layer (Redis)
- [ ] Add API documentation (Swagger/OpenAPI)

## 📝 API Documentation

### Gateway Service (Port 3000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create new user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get product by ID |
| POST | `/api/products` | Create new product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |

### Users Service (Port 3001)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/users` | Get all users (supports ?role=admin&limit=10) |
| GET | `/users/:id` | Get user by ID |
| POST | `/users` | Create new user |
| PUT | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |
| GET | `/stats/users` | Get user statistics |

### Products Service (Port 3002)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/products` | Get all products (supports filters) |
| GET | `/products/:id` | Get product by ID |
| GET | `/search?q=term` | Search products |
| GET | `/categories` | Get all categories |
| POST | `/products` | Create new product |
| PUT | `/products/:id` | Update product |
| DELETE | `/products/:id` | Delete product |
| PATCH | `/products/:id/stock` | Update stock quantity |
| GET | `/stats/products` | Get product statistics |

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - feel free to use this project for learning and development.

## 📧 Contact

For questions or support, please open an issue in the repository.

---

**Note**: This is a learning project demonstrating microservices architecture with VirtualBox. For production use, consider using container orchestration platforms like Kubernetes or Docker Swarm.
