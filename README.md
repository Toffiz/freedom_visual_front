# Freedom Visual - Beautiful Visual Presentation Platform

A modern, beautiful web application for uploading, managing, and presenting your visual content with an elegant frontend and robust backend.

![Freedom Visual](https://img.shields.io/badge/status-ready-green) ![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![Tailwind](https://img.shields.io/badge/Tailwind-3-blue)

## ✨ Features

### 🎨 Beautiful Frontend
- **Modern React Interface**: Built with React 18 + TypeScript + Vite
- **Responsive Design**: Beautiful UI that works on all devices
- **Dark/Light Theme**: Toggle between themes with smooth transitions  
- **Grid & List Views**: Multiple ways to browse your images
- **Drag & Drop Upload**: Intuitive file upload experience
- **Real-time Search**: Search by filename, description, or tags
- **Image Lightbox**: Full-screen image viewing with metadata
- **Professional Styling**: Clean design with Tailwind CSS and custom animations

### 🚀 Robust Backend
- **Node.js + Express**: Fast, scalable RESTful API
- **TypeScript**: Type-safe server-side code
- **Image Processing**: Automatic optimization with Sharp
- **SQLite Database**: Simple, reliable data storage
- **File Management**: Smart upload handling and organization
- **Metadata Extraction**: Automatic image analysis
- **Security Features**: CORS, Helmet, compression, and input validation

### 📸 Image Management
- **Multi-file Upload**: Upload multiple images at once
- **Smart Processing**: Automatic WebP conversion for optimal performance
- **Tagging System**: Organize images with custom tags
- **Descriptions**: Add rich descriptions to your images
- **Download Support**: Easy image downloading
- **Deletion Management**: Clean removal with confirmation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd freedom-visual-front
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm run install:all
   \`\`\`

3. **Start development servers**
   \`\`\`bash
   npm run dev
   \`\`\`

   This starts both backend (port 3001) and frontend (port 5173) concurrently.

4. **Open your browser**
   Visit [http://localhost:5173](http://localhost:5173)

## 📱 Usage

1. **Upload Images**: Click the "Upload" button or drag & drop files
2. **Add Metadata**: Include descriptions and tags for better organization  
3. **Browse Collection**: Switch between grid and list views
4. **Search & Filter**: Find images quickly using the search bar
5. **View Details**: Click any image to open the detailed lightbox view
6. **Manage Images**: Download or delete images as needed

## 🏗️ Project Structure

\`\`\`
freedom-visual-front/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── database/       # Database setup and models
│   │   ├── types/          # TypeScript type definitions
│   │   └── index.ts        # Server entry point
│   ├── uploads/            # Image storage directory
│   └── package.json
├── frontend/               # React + TypeScript frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── types.ts        # Type definitions
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # Entry point
│   └── package.json
└── package.json           # Root package.json with dev scripts
\`\`\`

## 🛠️ Development

### Available Scripts

- \`npm run dev\` - Start both frontend and backend in development mode
- \`npm run dev:frontend\` - Start only the frontend dev server
- \`npm run dev:backend\` - Start only the backend dev server
- \`npm run build\` - Build both frontend and backend for production
- \`npm run lint\` - Run ESLint on both projects
- \`npm start\` - Start the production backend server

### API Endpoints

- \`GET /api/images\` - Get paginated list of images
- \`GET /api/images/:id\` - Get specific image details
- \`POST /api/images/upload\` - Upload new images
- \`DELETE /api/images/:id\` - Delete an image
- \`GET /api/health\` - Health check endpoint

### Environment Variables

Create a \`.env\` file in the backend directory:

\`\`\`env
PORT=3001
NODE_ENV=development
\`\`\`

## 🎨 Customization

### Styling
The frontend uses Tailwind CSS with custom animations and components defined in:
- \`frontend/src/index.css\` - Global styles and custom classes
- \`frontend/tailwind.config.js\` - Tailwind configuration

### Backend Configuration  
- Database: SQLite (easily switchable to PostgreSQL/MySQL)
- File Storage: Local filesystem (easily extensible to cloud storage)
- Image Processing: Sharp library for optimization

## 🚀 Deployment

### Docker (Recommended)

Create a Dockerfile in the root directory and deploy using your preferred container platform.

### Traditional Deployment

1. **Build the projects**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Configure production environment**
   - Set NODE_ENV=production
   - Configure reverse proxy (nginx/Apache)
   - Set up SSL certificates

3. **Start the production server**
   \`\`\`bash
   npm start
   \`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first styling approach
- Sharp for excellent image processing capabilities
- The open-source community for all the great tools and libraries

---

**Built with ❤️ for beautiful visual presentations**