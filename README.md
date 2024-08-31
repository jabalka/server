# DevPlace Server API

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
  - [API Endpoints](#api-endpoints)
    - [Projects](#projects)
    - [Users](#users)
- [Middleware](#middleware)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## Introduction

DevPlace Server is a RESTful API built with Node.js, Express, and MongoDB. This API serves as the backend for managing user projects and profiles, including functionalities for authentication, authorization, and CRUD operations on projects. It is created to serve as the backend side for the DevPlace application built with Angular, which can be found [here](https://github.com/jabalka/DevPlace).

## Features

- User authentication and authorization
- CRUD operations for projects
- Session management
- Profile picture uploads
- CORS support

## Technologies Used
### Backend

- Node.js
- Express
- MongoDB

### Libraries

- `express`
- `express-session`
- `cookie-parser`
- `mongoose`
- `cors`
  
## Installation
### Prerequisites
- Node.js (v12.x or higher)
- npm (v6.x or higher)
- MongoDB (local or cloud instance)
  
To get started with DevPlace API, follow these steps:

### Steps
1. **Clone the repository:**
     ```bash
     git clone https://github.com/jabalka/server.git
     cd devplace
     ```
2. **Install dependencies:**
     ```bash
     npm install
     ```  
3. **Set up environment variables: Create a .env file in the root directory and add your MongoDB connection string and any other necessary configuration.**

4. **Run MongoDB: Ensure you have MongoDB running locally or use a MongoDB service.**

## Usage

  **Running the Server**
  
  To start the server, use the following command:
  ```bash
  npm start
  ```
## API Endpoints

### Projects
  + ***Get all projects:***
     ```bash
     GET /projects
     ```
      *Query parameters:*
    - page (default: 1)
    - pageSize (default: 2)
    - _ownerId (optional)
  + ***Create a new project:***
     ```bash
     POST /projects
     ```
      *Request body:*
     ```bash
     {
      "title": "Project Title",
      "description": "Project Description",
      "language": "JavaScript",
      "code": "console.log('Hello, world!');"
     }
       ```
+ ***Get a project by ID:***
     ```bash
  GET /projects/:id
   ```
+ ***Update a project by ID:***
     ```bash
  PUT /projects/:id
   ```
+ ***Delete a project by ID:***
     ```bash
  DELETE /projects/:id
   ```
### Users
+ ***Register a new user:***
     ```bash
      POST /user/register
     ```
    *Request body:*
     ```bash
  {
    "email": "user@example.com",
    "password": "password123!"
  }
     ```
+ ***Login a user:***
    ```bash
  POST /user/login
   ```
    *Request body:*
  ```bash
  {
    "email": "user@example.com",
    "password": "password123!"
  }
   ```
+ ***Logout a user:***
    ```bash
  GET /user/logout
   ```
+ ***Get user profile:***
    ```bash
  GET /user/profile
   ```
+ ***Update user profile:***
    ```bash
  PUT /user/profile
   ```
+ ***Delete user profile:***
    ```bash
  DELETE /user/profile/:id
   ```
+ ***Upload profile picture:***
*Multipart/form-data with profilePicture field*
    ```bash
  PUT /user/profile-picture
   ```

## Middleware

+ **Authentication (auth)**
+ **Authorization Guards (isAuth, isOwner)**
+ **CORS (corsMiddleware)**
+ **Preloaders (preload)**

## Configuration
Configuration settings are stored in the config directory. Ensure you set the appropriate environment variables in your .env file.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
