# Mitt Arv Blog Platform
## Full Stack Blog Application - Software Engineering Internship Assignment

[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=for-the-badge)](https://mitt-arv-blog-platform.vercel.app)
[![API Status](https://img.shields.io/badge/API-Online-green?style=for-the-badge)](https://mitt-arv-blog-api.railway.app)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

---

## 🚀 Live Application

- **🌍 Frontend**: [https://mitt-arv-blog-platform.vercel.app](https://mitt-arv-blog-platform.vercel.app)
- **🔌 Backend API**: [https://mitt-arv-blog-api.railway.app](https://mitt-arv-blog-api.railway.app)
- **❤️ Health Check**: [https://mitt-arv-blog-api.railway.app/api/health](https://mitt-arv-blog-api.railway.app/api/health)

---

## 📱 Features

### ✅ **User Authentication & Management**
- JWT-based secure authentication
- User registration and login
- Profile management with image upload
- Password hashing with bcrypt

### ✅ **Blog Operations**
- Create, read, update, delete blog posts
- Rich text content with image support
- Tag system for post categorization
- Post search and filtering

### ✅ **User Experience**
- Responsive design for all devices
- Professional Instagram-inspired UI
- Real-time profile updates
- Like and bookmark system
- Advanced search functionality

### ✅ **Technical Excellence**
- RESTful API architecture
- MongoDB Atlas cloud database
- Cloudinary image storage
- Production-ready deployment
- Security best practices

---

## 🛠️ Technology Stack

### **Frontend**
- **React 19** - Modern UI library
- **React Router DOM** - Client-side routing
- **SCSS** - Advanced styling
- **Axios** - HTTP client
- **Vite** - Build tool and dev server

### **Backend**
- **Node.js 18+** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **JWT** - Authentication tokens
- **Cloudinary** - Image storage CDN

### **Deployment & DevOps**
- **Frontend**: Vercel (Automatic deployments)
- **Backend**: Railway (Container deployment)
- **Database**: MongoDB Atlas (Managed cloud)
- **Storage**: Cloudinary CDN
- **Version Control**: Git & GitHub

---

## 🏗️ Project Architecture

mitt-arv-blog-platform/
├── backend/ # Node.js Express API
│ ├── src/
│ │ ├── config/ # Database & app configuration
│ │ ├── models/ # MongoDB schemas
│ │ ├── routes/ # API endpoints
│ │ ├── middleware/ # Authentication & validation
│ │ └── server.js # Application entry point
│ ├── .env.example # Environment variables template
│ └── package.json # Backend dependencies
├── frontend/ # React Application
│ ├── src/
│ │ ├── components/ # Reusable UI components
│ │ ├── pages/ # Application pages
│ │ ├── styles/ # SCSS stylesheets
│ │ └── config/ # API configuration
│ ├── vite.config.js # Vite build configuration
│ └── package.json # Frontend dependencies
├── docs/ # Documentation
│ ├── API.md # API documentation
│ ├── DEPLOYMENT.md # Deployment guide
│ └── AI-USAGE.md # AI tools usage report
└── README.md # Project overview


---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18 or higher
- npm or yarn package manager
- MongoDB Atlas account (for database)
- Cloudinary account (for image storage)

### **Local Development**

1. **Clone the repository**
https://github.com/niranjan945/blog-platform.git
cd blog-platform


2. **Backend Setup**
cd backend
npm install
cp .env.example .env

Configure environment variables in .env
npm run dev


3. **Frontend Setup**
cd ../frontend
npm install
npm run dev


4. **Access Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/health

---

## 🔑 Environment Configuration

### **Backend (.env)**
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
FRONTEND_URL=http://localhost:3000


### **Frontend (.env)**
VITE_API_URL=https://mitt-arv-blog-api.railway.app
VITE_APP_NAME=Blog Platform
VITE_APP_VERSION=1.0.0


---

## 📖 API Documentation

For detailed API documentation, see [docs/API.md](docs/API.md)

### **Authentication Endpoints**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### **Posts Endpoints**
- `GET /api/posts` - Get all posts (public)
- `GET /api/posts/:id` - Get single post (public)
- `POST /api/posts` - Create post (authenticated)
- `PUT /api/posts/:id` - Update post (authenticated)
- `DELETE /api/posts/:id` - Delete post (authenticated)

### **Users Endpoints**
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:id` - Get user by ID (public)

---

## 🤖 AI Tools Usage

This project leveraged various AI tools throughout development:

For detailed AI usage report, see [docs/AI-USAGE.md](docs/AI-USAGE.md)

### **Tools Used**
- **Perplexity** - Code completion and boilerplate generation , Architecture decisions and problem-solving
- **AI-powered debugging** - Error resolution and optimization

### **Specific Applications**
1. **Authentication System** - AI-generated JWT middleware and validation
2. **React Components** - Component structure and hooks optimization
3. **Database Design** - MongoDB schema optimization
4. **Error Handling** - Comprehensive error handling patterns
5. **Responsive Design** - CSS/SCSS optimizations

---

## 🚀 Deployment

The application is deployed using modern cloud platforms:

For detailed deployment guide, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

- **Frontend**: Vercel with automatic GitHub integration
- **Backend**: Railway with container deployment
- **Database**: MongoDB Atlas managed cloud service
- **CDN**: Cloudinary for image storage and delivery

---

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** using bcrypt
- **Input Validation** and sanitization
- **Rate Limiting** to prevent abuse
- **CORS Configuration** for secure cross-origin requests
- **XSS Protection** and security headers
- **Environment Variables** for sensitive data

---

## 📈 Performance Optimizations

- **Image Optimization** with Cloudinary CDN
- **Lazy Loading** for React components
- **Code Splitting** with Vite bundler
- **Compression** middleware for API responses
- **Caching Strategies** for frequently accessed data
- **Optimized Database Queries** with MongoDB indexing

---

## 📝 Development Process

### **Development Methodology**
- **Agile Development** with iterative improvements
- **Component-Based Architecture** for maintainability
- **API-First Design** for scalable backend
- **Mobile-First Responsive Design**
- **Test-Driven Development** principles

### **Code Quality**
- **ESLint Configuration** for code consistency
- **Modern JavaScript/React** patterns
- **SCSS Architecture** with variables and mixins
- **Error Handling** at all application levels
- **Environment-Based Configuration**

---

## 🎯 Future Enhancements

- [ ] Real-time Notifications with Socket.io
- [ ] Advanced Text Editor with rich formatting
- [ ] Social Media Integration for sharing
- [ ] Email Notifications for user activities
- [ ] Advanced Analytics dashboard
- [ ] Multi-language Support (i18n)
- [ ] Progressive Web App (PWA) features
- [ ] Automated Testing suite

---

## 🤝 Contributing

This project was developed as part of the **Mitt Arv Software Engineering Internship** assignment.

While it's primarily an assignment submission, feedback and suggestions are welcome.

### **Development Guidelines**
1. Follow existing code style and patterns
2. Ensure responsive design compatibility
3. Add appropriate error handling
4. Update documentation for new features
5. Test thoroughly before committing

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Developer

**Niranjan**
- Email: niranjan024cmrit@gmail.com
- GitHub: [@niranjan](https://github.com/niranjan945)
- LinkedIn: [Niranjan Profile](https://www.linkedin.com/in/avula-niranjan/)

---

## 🙏 Acknowledgments

- **Mitt Arv Team** for the internship opportunity
- **Open Source Community** for amazing tools and libraries
- **AI Development Tools** for accelerating development
- **Cloud Platforms** for reliable hosting services

---

## 📊 Project Stats

- **Development Time**: 4 days intensive development
- **Total Lines of Code**: 2000+ lines
- **Components**: 15+ React components
- **API Endpoints**: 12 RESTful endpoints
- **Database Collections**: 2 MongoDB collections
- **Deployment Platforms**: 3 cloud services

---

🚀 **Built with passion for the Mitt Arv Software Engineering Internship Assignment**

*Transforming ideas into scalable web applications*
