# Modular ERP System with MAS and KG-RAG Integration


## 📋 Project Overview

This project aims to develop a modern Enterprise Resource Planning (ERP) system with future integration capabilities for Multi-Agent Systems (MAS) and Knowledge Graph-enhanced Retrieval-Augmented Generation (KG-RAG). The system is built with a modular architecture to facilitate easy maintenance and future enhancements.

### Key Features

- Modular ERP system with core business functionalities
- Modern web interface built with Next.js
- RESTful API architecture
- Future-ready for AI integration
- Scalable and maintainable codebase

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher)
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd [repository-name]
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration.

4. Start the development server:
   ```bash
   pnpm dev
   ```

The application will be available at `http://localhost:3000`

## 🏗️ Project Structure

```
├── app/              # Next.js app directory
├── backend/          # Backend services and API
├── components/       # Reusable UI components
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and shared code
├── public/          # Static assets
└── styles/          # Global styles and CSS modules
```

## 🛠️ Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm test` - Run tests

### Backend API (FastAPI)

The backend lives in the `backend/` directory. To run it locally with SQLite:

```bash
cd backend
./setup-tests.sh
export DATABASE_URL=sqlite:///erp.db  # optional, defaults to this value
uvicorn main:app --reload
```
Both `requirements.txt` and `requirements-test.txt` must be installed before running `pytest`. The `setup-tests.sh` script installs them for you.

Tables are created automatically on startup. Tests can be executed with:

```bash
pytest
```

### Code Style

We use ESLint and Prettier for code formatting. Run `pnpm lint` to check your code style.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Pull Request Process

1. Update the README.md with details of changes if needed
2. Update the documentation if needed
3. Ensure all tests pass
4. The PR will be merged once you have the sign-off of at least one other developer

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔮 Future Roadmap

- Integration of Multi-Agent Systems (MAS)
- Implementation of Knowledge Graph-enhanced RAG
- Enhanced analytics and reporting
- Mobile application development
- Advanced security features

## 📞 Support

For support, please open an issue in the GitHub repository or contact the maintainers.

---
*Note: This project is under active development. Features and documentation will be updated regularly.*
