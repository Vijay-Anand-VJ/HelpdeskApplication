# 🎫 HelpDesk Pro - MERN Stack Support System

A full-stack enterprise Helpdesk application designed to streamline customer support, issue tracking, and SLA management. Built with the MERN stack (MongoDB, Express, React, Node.js).

![Project Status](https://img.shields.io/badge/Status-Completed-success)

## 🚀 Key Features

* **Role-Based Access**: Distinct dashboards for Customers, Agents, and Admins.
* **SLA Tracking**: Automated deadlines (Critical = 1hr, High = 4hrs) with visual timers.
* **Ticket Management**: Full lifecycle tracking (Open -> In Progress -> Closed).
* **File Attachments**: Secure file uploads for screenshots/logs.
* **Real-Time Analytics**: Visual charts (Bar/Pie) for team performance.
* **Knowledge Base**: Self-service articles to reduce ticket volume.
* **Email Notifications**: Automated alerts for new tickets.

## 🛠️ Tech Stack

* **Frontend**: React (Vite), Tailwind CSS, Recharts, Lucide Icons.
* **Backend**: Node.js, Express.js.
* **Database**: MongoDB (Mongoose).
* **DevOps**: Multer (Uploads), Nodemailer (Emails), JWT (Auth).

## 📦 Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/your-username/helpdesk-pro.git](https://github.com/your-username/helpdesk-pro.git)
    ```

2.  **Backend Setup**
    ```bash
    cd helpdesk-backend
    npm install
    # Create .env file with PORT, MONGO_URI, and JWT_SECRET
    npm run dev
    ```

3.  **Frontend Setup**
    ```bash
    cd ../helpdesk-app
    npm install
    npm run dev
    ```

## 🔗 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user & get Token |
| `GET` | `/api/tickets` | Retrieve tickets (User or Global) |
| `POST` | `/api/tickets` | Create ticket with file attachment |
| `GET` | `/api/tickets/stats` | Retrieve visualization data |

---
© 2026 HelpDesk Pro Project.