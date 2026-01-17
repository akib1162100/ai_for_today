# 🌌 Private Space (ai_for_today)

A premium, secure, and personal digital sanctuary for your thoughts, memories, and creative expressions. Built with a modern tech stack, it offers a seamless experience for journaling, blogging, and media management.

---

## ✨ Key Features

- **🔐 Secure Authentication**: Robust JWT-based authentication system to keep your "Private Space" truly private.
- **📓 Dynamic Journaling**: Document your daily life with rich-text entries and integrated media galleries.
- **📰 Personal Blog**: Share longer-form stories and reflections.
- **📸 Media Albums**: A dedicated space for photos and videos with support for both private and public sharing.
  - *Storage Management*: Integrated 100MB storage cap to keep your space lean and fast.
- **📊 Interactive Dashboard**: At-a-glance overview of your activity and storage usage.
- **👤 Profile Management**: Customize your presence with personalized profile settings.
- **📱 Responsive Design**: A beautifully crafted UI that feels premium and works across all devices.

---

## 🛠️ Tech Stack

### Backend
- **[FastAPI](https://fastapi.tiangolo.com/)**: High-performance Python framework for building APIs.
- **[SQLAlchemy](https://www.sqlalchemy.org/)**: Powerful SQL Toolkit and Object Relational Mapper.
- **[SQLite](https://www.sqlite.org/)**: Lightweight, serverless database for easy portability.
- **[Pydantic](https://docs.pydantic.dev/)**: Data validation and settings management using Python type annotations.
- **[python-jose](https://python-jose.readthedocs.io/en/latest/)**: JWT (JSON Web Token) implementation for security.

### Frontend
- **[React.js](https://reactjs.org/)**: Declarative, efficient, and flexible JavaScript library for building user interfaces.
- **[Vite](https://vitejs.dev/)**: The next-generation frontend tool for blazing-fast development.
- **[Lucide React](https://lucide.dev/)**: Beautifully simple, pixel-perfect icons.
- **[Axios](https://axios-http.com/)**: Promise-based HTTP client for the browser.
- **Vanilla CSS**: Custom-crafted styles for a unique and premium aesthetic.

---

## 🚀 Quick Start

### Prerequisites
- [Docker](https://www.docker.com/products/docker-desktop/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Running with Docker (Recommended)

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd ai_for_today
   ```

2. **Start the application**:
   ```bash
   docker-compose up --build
   ```

3. **Access the app**:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📁 Project Structure

```text
ai_for_today/
├── app/
│   ├── backend/          # FastAPI application
│   │   ├── routers/      # API endpoints (Auth, Journal, Blog, Album, etc.)
│   │   ├── models.py     # Database models
│   │   ├── schemas.py    # Pydantic models
│   │   └── main.py       # Application entry point
│   ├── frontend/         # React application
│   │   ├── src/          # Source code
│   │   └── package.json  # Dependencies
│   └── uploads/          # Persistent storage for images and videos
├── docker-compose.yml    # Orchestration for backend and frontend services
└── README.md             # Project documentation
```

---

## 🏗️ Architecture

The project follows a decoupled client-server architecture:
- **Backend**: A RESTful API serving as the source of truth, managing data persistence and security.
- **Frontend**: A single-page application (SPA) providing a fluid and interactive user experience.
- **Storage**: Media files are served from a dedicated `uploads` volume, ensuring persistence across container restarts.

---

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

> [!TIP]
> This project was developed as a "Vibe Coding" experiment using **Antigravity**.
# ai\_for\_today

# A vibe coding experimental project (antigravity)

hello

