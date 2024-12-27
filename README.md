# TaskMaster

TaskMaster is a task management application designed to help users organize and manage their projects efficiently. The application allows users to create and manage multiple projects, each containing tasks with various attributes and states.

## Features

### Project Management
- Users can create multiple projects to organize their work effectively.

### Task Management
Each project contains tasks with the following attributes:
- **Title**: A short description of the task.
- **Priority**: The priority level of the task (e.g., High, Medium, Low).
- **Assignee ID**: The user assigned to the task.
- **Status**: The current status of the task (To Do, In Progress, Done).

### User Collaboration
- Users can invite other users to join their projects.
- Each user in a project can be assigned a specific role:
  - **Manager**: Full access to manage the project and tasks.
  - **Contributor**: Limited access to modify tasks.
  - **Viewer**: Read-only access to the project.

### Notifications
- Users receive email notifications when they are added to or removed from a project.

## Tech Stack

### Backend
- **Node.js**
- **Express**
- **MongoDB**
- **PostgreSQL**
- **Sequelize(ORM)**
- **Kafka**
- **Redis**

### JWT for user Authentication

### Frontend 
- **React.js**
- **Tailwind CSS**

### Messaging System
- **Apache Kafka** for asynchronous notifications through email.

### Caching
- **Redis** for caching the tasks in the project when retrieving.

### Notification Service
- Email notifications using **Node.js libraries**.

### SQL Schema
<img width="487" alt="image" src="https://github.com/user-attachments/assets/fd961cae-4bbd-42f3-b62a-dad349067a2d" />


# TaskMaster Project Setup Guide

This guide will walk you through setting up the TaskMaster project on your local machine.

## Prerequisites

Before you begin, make sure you have the following installed:

1. **Node.js** (v16.x or higher): Download and install from [Node.js Official Website](https://nodejs.org/).
2. **npm**: Comes bundled with Node.js.
3. **MongoDB**: Install and set up MongoDB on your system. Refer to the [MongoDB Installation Guide](https://docs.mongodb.com/manual/installation/) for instructions.
4. **PostgreSQL**: Ensure PostgreSQL is installed and running if required by the backend.
5. **Apache Kafka**: Install Kafka and Zookeeper. Refer to the [Kafka Quickstart Guide](https://kafka.apache.org/quickstart) for instructions.
6. **Git**: Install Git to clone the repository. Refer to the [Git Downloads Page](https://git-scm.com/downloads).
7. **Redis**: Ensure Redis is connected.

## Setting Up the Project

Follow these steps to set up the project:

### Step 1: Clone the Repository

1. Open your terminal or command prompt.
2. Clone the TaskMaster repository:

   ```bash
   git clone https://github.com/maurya-kamminana/TaskMaster.git
   ```

3. Navigate to the project directory:

   ```bash
   cd TaskMaster/backend
   ```

### Step 2: Install Dependencies

1. Run the following command to install all required dependencies:

   ```bash
   npm install
   ```

### Step 3: Create Kafka Topics

1. Create the necessary Kafka topics for the project:

   ```bash
   kafka-topics --create --topic project.user.added --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
   kafka-topics --create --topic project.user.removed --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
   ```

### Step 4: Set Up Environment Variables

Create `.env` file in the backend directory and add the necessary environment variables. For example:

#### `backend/.env`

```env
MONGO_URI=your_mongo_database_connection_string
POSTGRES_URI=your_postgres_database_connection_string
PORT=3000
PORT_AUTH=4000
PORT_NOTIFICATION=5000
KAFKA_BROKER=localhost:9092
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_passkey
```

Replace the placeholders with appropriate values.

### Step 5: Start Kafka and Zookeeper

1. Start Zookeeper(for macOS):

   ```bash
   zookeeper-server-start /opt/homebrew/etc/kafka/zookeeper.properties
   ```

2. Start Kafka(for macOS):

   ```bash
   kafka-server-start /opt/homebrew/etc/kafka/server.properties
   ```

### Step 6: Start the Servers

Refer to the `package.json` scripts in each directory for starting the servers. Use the following commands:

1. Start the backend server:

   ```bash
   npm run server
   ```

2. Start the authentication server:

   ```bash
   npm run AuthServer
   ```

3. Start the notification server:

   ```bash
   npm run NotificationServer
   ```

### Step 7: Run the Frontend (Optional)

If the project includes a frontend:

1. Navigate to the `frontend` directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the frontend server:

   ```bash
   npm run start
   ```

### Step 8: Verify the Application

1. Ensure all servers (backend, authServer, NotificationServer) are running.
2. Open your browser and navigate to `http://localhost:3000` (if running the frontend).
3. Use tools like [Postman](https://www.postman.com/) to test backend APIs.

## Additional Notes

- If you encounter issues connecting to the database or Kafka, double-check the connection strings and ensure the services are running.
- For Kafka setup and testing, you may need to create topics manually using Kafka CLI tools.
- For further assistance or to report issues, refer to the [GitHub repository](https://github.com/maurya-kamminana/TaskMaster).


# TaskMaster Overview
<img width="1437" alt="image" src="https://github.com/user-attachments/assets/1914f77b-f307-4f39-9352-08b05815ee08" />
