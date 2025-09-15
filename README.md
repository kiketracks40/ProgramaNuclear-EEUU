# ⚛️ Nuclear Simulator Platform

> Interactive web platform for nuclear program analysis with AI predictions, 3D simulations, and comprehensive historical data.

[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0+-green.svg)](https://mongodb.com/)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-AI-orange.svg)](https://tensorflow.org/js)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🌟 Features

- **🔬 3D Nuclear Simulator** - Real-time physics simulations with particle interactions
- **📅 Interactive Timeline** - 80+ years of US nuclear program history (1942-2025)
- **🧮 Advanced Calculator** - Nuclear physics equations, mass criticality, and decay calculations
- **🗺️ Facility Mapping** - Interactive map with 60+ nuclear installations worldwide
- **🤖 AI Dashboard** - Machine learning predictions and trend analysis with TensorFlow.js
- **⚛️ Materials Database** - Comprehensive nuclear isotope information and comparisons

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 7.0+

### Installation

1. **Clone the repository**
```bash
   git clone https://github.com/kiketracks40/ProgramaNuclear-EEUU.git
   cd nuclear-simulator


2.Backend Setup

cd backend
   npm install
   npm run seed    # Populate database with sample data
   npm run dev     # Start backend server (port 5000)

3. Frontend Setup

cd frontend
   npm install
   npm start       # Start React app (port 3000)

4. Access the application

🌐 Frontend: http://localhost:3000
📡 API: http://localhost:5000/api

🛠️ Tech Stack
Frontend

React 18 - Modern UI with hooks
Bootstrap 5 - Responsive design
Three.js - 3D visualizations
Chart.js - Data visualization
TensorFlow.js - AI predictions
Leaflet - Interactive maps

Backend

Node.js + Express - REST API
MongoDB + Mongoose - Database
JWT - Authentication
bcrypt - Security

📊 Project Structure
nuclear-simulator/
├── backend/                 # Node.js API server
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   └── seedDatabase.js     # Sample data
├── frontend/               # React application
│   ├── src/components/     # React components
│   │   ├── Simulator/      # 3D nuclear simulator
│   │   ├── Timeline/       # Historical timeline
│   │   ├── Calculator/     # Physics calculator
│   │   ├── Map/           # Facility mapping
│   │   ├── Dashboard/     # AI dashboard
│   │   └── Materials/     # Nuclear materials DB
│   └── public/            # Static assets
🎯 Core Modules
ModuleDescriptionTechnologySimulator3D nuclear fission visualizationThree.js, WebGLTimelineInteractive historical eventsReact, animationsCalculatorNuclear physics computationsMathJS, real equationsMapGlobal nuclear facilitiesLeaflet, real coordinatesDashboardAI predictions & analyticsTensorFlow.js, Chart.jsMaterialsIsotope database & comparisonsMongoDB, React
🧠 AI Features

Historical Pattern Analysis - 80 years of nuclear data
Arsenal Predictions - Future capabilities forecasting (2025-2050)
Geopolitical Risk Assessment - Multi-factor analysis
Real-time Processing - Browser-based machine learning

📈 Sample Data
The platform includes authentic historical data:

Timeline: Manhattan Project to modern treaties
Facilities: Major nuclear installations (reactors, test sites, labs)
Materials: Key isotopes (U-235, Pu-239, etc.)
Statistics: Real nuclear program metrics

🔒 Security

JWT authentication system
Password hashing with bcrypt
Input validation & sanitization
Rate limiting on API endpoints
CORS protection

🚀 API Endpoints
bash# Health check
GET /api/health

# Statistics
GET /api/stats

# Timeline events
GET /api/timeline
GET /api/timeline/:id

# Nuclear facilities  
GET /api/facilities
GET /api/facilities/:id

# Nuclear materials
GET /api/materials
GET /api/materials/:id
🎓 Educational Purpose
This platform is designed for:

Nuclear education and research
Historical analysis of nuclear programs
Physics demonstrations and calculations
Data visualization and trend analysis
Policy research and academic study

🤝 Contributing

Fork the repository
Create a feature branch (git checkout -b feature/amazing-feature)
Commit changes (git commit -m 'Add amazing feature')
Push to branch (git push origin feature/amazing-feature)
Open a Pull Request

📝 License
This project is licensed under the MIT License - see the LICENSE file for details.
🙏 Acknowledgments

Manhattan Project Historical Archives
International Atomic Energy Agency (IAEA)
Nuclear data from official government sources
Three.js community for 3D graphics
TensorFlow.js team for machine learning capabilities
 
