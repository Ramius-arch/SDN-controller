# SDN Controller

## Project Description
This project implements a Software-Defined Networking (SDN) controller designed to manage network devices and traffic flows through a centralized control plane. It provides a web-based interface for network administrators to configure flow rules, manage Quality of Service (QoS) policies, and monitor network status.

## Features
*   **Centralized Network Control:** Manage network devices and traffic from a single point.
*   **Flow Rule Management:** Create, modify, and delete flow rules on network switches.
*   **Quality of Service (QoS) Management:** Implement and enforce QoS policies to prioritize network traffic.
*   **User Authentication & Authorization:** Secure access to the controller with user authentication and role-based access control.
*   **Web-based User Interface:** Intuitive dashboard for network monitoring and configuration.
*   **RESTful API:** Programmatic access to controller functionalities.

## Architecture

The SDN Controller is built with a hybrid backend approach, combining the strengths of Node.js and Python, and a modern React.js frontend.

### Frontend
*   **React.js:** A JavaScript library for building user interfaces, providing a dynamic and responsive web application.

### Backend
The backend is composed of two main services:

*   **Node.js (Express.js):**
    *   Serves the web interface.
    *   Handles user authentication and authorization.
    *   Exposes a RESTful API for frontend communication.
    *   Orchestrates interactions with the Python-based SDN core.
*   **Python (Flask):**
    *   Provides core SDN functionalities, including:
        *   Flow Rule Management (`flow_rule_manager.py`)
        *   Quality of Service (QoS) Handling (`qos_handler.py`)
    *   Exposes an API that the Node.js backend interacts with for network control operations.

### Database
*   **Sequelize ORM:** Used by the Node.js backend for database interactions. (Specific database type can be configured via environment variables, e.g., PostgreSQL, MySQL, SQLite).

## Setup and Installation

To set up and run the SDN Controller, follow these steps:

### Prerequisites
*   Node.js (LTS version recommended)
*   npm (comes with Node.js)
*   Python 3.x
*   pip (comes with Python)

### Backend Setup

#### Node.js Service
1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install Node.js dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `backend` directory based on `network_config.yaml` (or a similar template if provided) and configure your database and other settings.
    ```
    # Example .env content
    PORT=3000
    DB_DIALECT=sqlite
    DATABASE=./data/database.sqlite
    DB_USER=user
    DB_PASSWORD=password
    DB_HOST=localhost
    DB_PORT=5432
    ```
4.  Start the Node.js backend server:
    ```bash
    npm start
    ```

#### Python Service
1.  Ensure you are in the `backend` directory.
2.  Install Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Start the Python Flask server (this might need to be run in a separate terminal or managed by a process manager):
    ```bash
    python server.py
    ```

### Frontend Setup
1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install Node.js dependencies:
    ```bash
    npm install
    ```
3.  Start the React development server:
    ```bash
    npm start
    ```
    This will typically open the application in your browser at `http://localhost:3000` (or another port if configured).

## Usage
Once both backend services and the frontend are running, open your web browser and navigate to the address where the frontend is served (e.g., `http://localhost:3000`). You can then log in (if authentication is configured) and start managing your SDN network.

## Contributing
Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## License
MIT License
