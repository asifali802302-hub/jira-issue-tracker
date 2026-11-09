# 🐛 Jira Issue Tracker & Bug Management System

An enterprise-grade, full-stack Issue & Bug Tracking System (Jira-like) built with **Java 21**, **Spring Boot 3**, **Spring Security (JWT)**, **Hibernate / JPA**, **PostgreSQL / H2**, **React 18**, and **Tailwind CSS**. It empowers agile software engineering teams to manage projects, assign issues, collaborate through comments, and organize sprint workflows across an interactive drag-and-drop Kanban board.

---

## 🌟 Core Features

* **📌 Interactive Kanban Board:** Drag-and-drop workflow (`TO DO` ➔ `IN PROGRESS` ➔ `DONE`) with persistent ordering powered by `@hello-pangea/dnd`.
* **🔐 Role-Based Access Control (RBAC):** Three distinct roles (`ROLE_ADMIN`, `ROLE_MANAGER`, `ROLE_DEVELOPER`) managing project creation, member assignments, and ticket lifecycle.
* **📁 Project & Team Management:** Create multiple projects with unique prefixes (e.g. `PROJ-101`), manage member rosters, and assign issues to team members.
* **🎫 Issue / Bug Management:** Full CRUD operations supporting Issue Types (`BUG`, `TASK`, `STORY`, `EPIC`) and Priorities (`URGENT`, `HIGH`, `MEDIUM`, `LOW`).
* **💬 Ticket Collaboration:** Threaded comments system on every issue for developer discussions, updates, and blockers.
* **🔍 Real-Time Filter & Search:** Filter by Status, Priority, Issue Type, or search dynamically by keyword across titles and descriptions.
* **📖 OpenAPI 3 / Swagger Documentation:** Interactive API explorer and Swagger UI at `/swagger-ui.html`.
* **📱 Modern Jira-Inspired Dark UI:** Built with Tailwind CSS, Lucide icons, and responsive layouts.

---

## 🧰 Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18 + Vite | Component-driven UI & fast bundling |
| **Styling** | Tailwind CSS v4 | Clean, modern Jira dark theme |
| **Drag & Drop** | @hello-pangea/dnd | Seamless Kanban column transitions |
| **Backend** | Java 21 + Spring Boot 3.3 | Enterprise RESTful architecture |
| **Security** | Spring Security 6 + JJWT | Stateless JWT authentication & RBAC |
| **ORM / Data** | Hibernate + Spring Data JPA | Relational data modeling & query optimization |
| **Database** | PostgreSQL (Prod) / H2 (Local) | Zero-friction local dev + cloud database |
| **API Docs** | Springdoc OpenAPI 3 (Swagger) | Auto-generated interactive API docs |

---

## 📁 Project Architecture

```text
jira-issue-tracker/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/         # Navbar, KanbanBoard, KanbanColumn, TicketCard, Modals, Comments
│   │   ├── context/            # AuthContext (JWT & Role persistence)
│   │   ├── pages/              # AuthPage, DashboardPage
│   │   ├── services/           # Axios service with Bearer token interceptor
│   │   ├── App.jsx             # Root layout & Toaster
│   │   └── main.jsx
│   ├── package.json
│   ├── vercel.json
│   └── vite.config.js
│
└── server/                     # Spring Boot Backend
    ├── src/main/java/com/jira/
    │   ├── controller/         # AuthController, ProjectController, IssueController, CommentController
    │   ├── dto/                # Request & Response DTOs with Jakarta Validation
    │   ├── model/              # JPA Entities (User, Project, Issue, Comment, Enums)
    │   ├── repository/         # Spring Data JPA interfaces
    │   ├── security/           # JWT Utils, Filter, SecurityConfig, OpenAPI Swagger
    │   ├── service/            # Business logic (Projects, Issues, Comments)
    │   └── JiraIssueTrackerApplication.java
    ├── src/main/resources/
    │   └── application.properties # H2 + PostgreSQL configurations & secrets
    ├── Dockerfile
    └── pom.xml
```

---

## 🚀 Running the Project Locally

### 1. Prerequisites
* **Java 17 or 21+** (`java -version`)
* **Apache Maven** (`mvn -v`)
* **Node.js 18+** (`node -v`)

---

### 2. Backend Setup (`server/`)

1. Open PowerShell / Terminal:
   ```bash
   cd server
   ```
2. Start the Spring Boot backend:
   ```bash
   mvn spring-boot:run
   ```
   *The server starts on `http://localhost:8080`.*
   * **Swagger UI API Explorer:** `http://localhost:8080/swagger-ui.html`
   * **H2 Console:** `http://localhost:8080/h2-console` *(JDBC URL: `jdbc:h2:mem:jiradb`)*

---

### 3. Frontend Setup (`client/`)

1. Open a second terminal:
   ```bash
   cd client
   ```
2. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   *The frontend starts on `http://localhost:5173`.*

---

## 📡 REST API Specifications

### 🔐 Authentication (`/api/auth`)
* `POST /api/auth/register` - Create user (`ROLE_DEVELOPER`, `ROLE_MANAGER`, `ROLE_ADMIN`).
* `POST /api/auth/login` - Authenticate & receive JWT token.
* `GET /api/auth/me` - Get logged-in user profile & role.
* `GET /api/auth/users` - Get list of team members for ticket assignment.

### 📁 Projects (`/api/projects`)
* `GET /api/projects` - List accessible projects.
* `POST /api/projects` - Create project (`name`, `key`, `description`, `memberIds`).
* `GET /api/projects/{id}` - Get project details.
* `PUT /api/projects/{id}` - Update project info (Manager/Owner only).
* `DELETE /api/projects/{id}` - Delete project.

### 🎫 Issues (`/api/issues`)
* `GET /api/issues/project/{projectId}` - List all tickets for project.
* `GET /api/issues/project/{projectId}/filter` - Filter tickets (`status`, `priority`, `assigneeId`, `query`).
* `POST /api/issues` - Create new ticket (`title`, `description`, `type`, `priority`, `status`, `assigneeId`).
* `PATCH /api/issues/{id}/status` - Move ticket status & update Kanban ordering.
* `PUT /api/issues/{id}` - Edit full ticket details.
* `DELETE /api/issues/{id}` - Delete ticket.

### 💬 Comments (`/api`)
* `GET /api/issues/{issueId}/comments` - List comments on issue.
* `POST /api/issues/{issueId}/comments` - Add comment.
* `DELETE /api/comments/{id}` - Delete comment.
