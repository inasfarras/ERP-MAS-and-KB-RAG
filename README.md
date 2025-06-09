# ERP-MAS: Modular ERP with AI Integration

A modern, open-source Enterprise Resource Planning (ERP) system designed for modularity and scalability. This project integrates a robust FastAPI backend with a reactive Next.js frontend, with a forward-looking architecture for future integration of Multi-Agent Systems (MAS) and Knowledge Graph-enhanced RAG (KG-RAG).

## ✨ Key Features

- **Monorepo Architecture**: Clean separation of frontend and backend concerns.
- **Modular Design**: Core ERP functionalities (Finance, HR, Sales, Inventory, Projects) are built as distinct modules.
- **Modern Tech Stack**: Built with Next.js, TypeScript, and Tailwind CSS on the frontend, and FastAPI with Python on the backend.
- **AI-Ready**: Designed for future integration with advanced AI capabilities like MAS and KG-RAG.

## 🛠️ Tech Stack

- **Frontend**:
  - [Next.js](https://nextjs.org/)
  - [React](https://react.dev/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [Tailwind CSS](https://tailwindcss.com/)
  - [Tremor](https://www.tremor.so/) for UI components
- **Backend**:
  - [FastAPI](https://fastapi.tiangolo.com/)
  - [Python](https://www.python.org/downloads/) (v3.10 or higher) and `pip`
  - [SQLAlchemy](https://www.sqlalchemy.org/) (for database interaction)
  - [SQLite](https://www.sqlite.org/index.html) (for local development)

## 🏗️ Project Structure

The project is organized as a monorepo with a clear separation between the frontend and backend applications.

```
.
├── backend/          # FastAPI application and all backend-related logic
├── frontend/         # Next.js application and all frontend-related logic
└── ...               # Root configuration files
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) (v8 or higher)
- [Python](https://www.python.org/downloads/) (v3.10 or higher) and `pip`
- [Git](https://git-scm.com/)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/inasfarras/ERP-MAS-and-KB-RAG.git
    cd ERP-MAS-and-KB-RAG
    ```

2.  **Set up the Backend:**
    Navigate to the `backend` directory, create a virtual environment, and install the required Python packages.

    ```bash
    cd backend
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    pip install -r requirements.txt
    ```

3.  **Set up the Frontend:**
    In a new terminal, navigate to the `frontend` directory and install the Node.js dependencies.

    ```bash
    cd frontend
    pnpm install
    ```

### Running the Application

1.  **Start the Backend Server:**
    From the `backend` directory (with the virtual environment activated), run:
    ```bash
    uvicorn main:app --reload
    ```
    The backend API will be available at `http://localhost:8000`.

2.  **Start the Frontend Development Server:**
    From the `frontend` directory, run:
    ```bash
    pnpm dev
    ```
    The frontend application will be available at `http://localhost:3000`.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'feat: Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.

Please ensure that your code adheres to the project's code style by running `pnpm lint` in the `frontend` directory.

## 📝 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

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
