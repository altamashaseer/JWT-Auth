 # JWT Authentication & Authorization API
 
 A simple yet robust Node.js and Express.js backend service demonstrating a complete authentication and authorization flow using JSON Web Tokens (JWT). It includes user registration, login, secure token refreshing, and protected route access, all connected to a MongoDB database.
 
 ## Features
 
 -   **User Registration**: Securely create new user accounts with hashed passwords using `bcryptjs`.
 -   **User Login**: Authenticate users and issue short-lived access tokens and long-lived refresh tokens.
 -   **Token-Based Authorization**: Protect routes using JWT access tokens.
 -   **Token Refresh**: Generate new access tokens using a valid refresh token without requiring the user to log in again.
 -   **Secure Logout**: Invalidate refresh tokens by removing them from the database, ensuring they cannot be reused.
 -   **Environment-based Configuration**: Uses a `.env` file to manage sensitive data and configuration.
 
 ## Technologies Used
 
 -   **Backend**: Node.js, Express.js
 -   **Database**: MongoDB with Mongoose for object data modeling.
 -   **Authentication**: JSON Web Token (jsonwebtoken)
 -   **Password Hashing**: bcryptjs
 -   **Environment Variables**: dotenv
 
 ## Prerequisites
 
 Before you begin, ensure you have the following installed:
 -   Node.js (v18.x or later recommended)
 -   npm (usually comes with Node.js)
 -   A running MongoDB instance (local or cloud-based like MongoDB Atlas).
 
 ## Installation & Setup
 
 1.  **Clone the repository:**
     ```bash
     git clone <your-repository-url>
     cd authentication-authorization
     ```
 
 2.  **Install dependencies:**
     ```bash
     npm install
     ```
 
 3.  **Create a `.env` file** in the root of the project and add the following environment variables. You can use the `.env.example` below as a template.
 
     ```.env.example
     # MongoDB Connection String
     DB_URI=mongodb://127.0.0.1:27017/auth-demo
     
     # Server Port
     PORT=3000
     
     # JWT Secrets - Use long, random, and unique strings for production
     JWT_ACCESS_SECRET=your_super_secret_access_key
     JWT_REFRESH_SECRET=your_super_secret_refresh_key
     
     # Token Expiration Times (https://github.com/vercel/ms)
     ACCESS_TOKEN_EXPIRATION=15m
     REFRESH_TOKEN_EXPIRATION=7d
     ```
 
 ## Running the Application
 
 To start the server, run the following command:
 
 ```bash
 node index.js
 ```
 
 The server will start on the port specified in your `.env` file (default is 3000).
 
 ## API Endpoints
 
 Here is a breakdown of the available API endpoints.
 
 ---
 
 ### 1. Register a New User
 
 -   **Endpoint**: `POST /register`
 -   **Description**: Creates a new user in the database.
 -   **Request Body**:
     ```json
     {
       "username": "testuser",
       "password": "password123"
     }
     ```
 -   **Responses**:
     -   `201 Created`: `User created successfully`
     -   `400 Bad Request`: `Username and password are required`
     -   `409 Conflict`: `User already exists`
     -   `500 Internal Server Error`
 
 ---
 
 ### 2. Log In
 
 -   **Endpoint**: `POST /login`
 -   **Description**: Authenticates a user and returns an access token and a refresh token.
 -   **Request Body**:
     ```json
     {
       "username": "testuser",
       "password": "password123"
     }
     ```
 -   **Responses**:
     -   `200 OK`:
         ```json
         {
           "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
           "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
         }
         ```
     -   `401 Unauthorized`: `Invalid username or password`
     -   `500 Internal Server Error`
 
 ---
 
 ### 3. Refresh Access Token
 
 -   **Endpoint**: `POST /token`
 -   **Description**: Issues a new access token using a valid refresh token.
 -   **Request Body**:
     ```json
     {
       "token": "your_refresh_token_here"
     }
     ```
 -   **Responses**:
     -   `200 OK`:
         ```json
         {
           "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
         }
         ```
     -   `401 Unauthorized`: If no refresh token is provided.
     -   `403 Forbidden`: `Invalid Refresh Token`
 
 ---
 
 ### 4. Log Out
 
 -   **Endpoint**: `DELETE /logout`
 -   **Description**: Invalidates the user's refresh token, effectively logging them out from the device/session associated with that token.
 -   **Request Body**:
     ```json
     {
       "token": "your_refresh_token_here"
     }
     ```
 -   **Responses**:
     -   `204 No Content`: On successful logout.
 
 ---
 
 ### 5. Access a Protected Route
 
 -   **Endpoint**: `GET /profile`
 -   **Description**: An example of a protected route that requires a valid access token for access.
 -   **Headers**:
     -   `Authorization`: `Bearer your_access_token_here`
 -   **Responses**:
     -   `200 OK`:
         ```json
         {
           "message": "Welcome, testuser! This is protected data.",
           "user": {
             "name": "testuser",
             "iat": 1677610000,
             "exp": 1677610900
           }
         }
         ```
     -   `401 Unauthorized`: `Authentication token required`
     -   `403 Forbidden`: `Token expired` or `Token is not valid`
 
 ## License
 
 This project is open-source and available under the MIT License.

