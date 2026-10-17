# CRUD API — Node.js, Express & MongoDB

A REST-style user management API built with Node.js, Express 5, and Mongoose. It includes user registration, password hashing, user listing and mutation endpoints, and a simple environment-configured admin login.

## Features

- MongoDB persistence with Mongoose
- User registration with bcrypt-hashed passwords
- UUID-based user identifiers
- User list, update, and delete endpoints
- JSON request handling, CORS, and security headers
- Health-check endpoint

## Requirements

- Node.js (a current LTS release is recommended)
- npm
- MongoDB, running locally or available through a connection URI

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root, using `.env.example` as a template:

   ```env
   PORT=4200

   ADMIN_USERNAME=your_admin_username
   ADMIN_PASSWORD=your_admin_password

   MONGODB_URI=mongodb://localhost:27017
   DATABASE=CRUD1
   ```

   Set `MONGODB_URI` and `DATABASE` to your MongoDB connection details. Keep real credentials in `.env`; do not commit that file.

3. Start the development server:

   ```bash
   npm run dev
   ```

   To run without the development watcher:

   ```bash
   npm start
   ```

The API listens on the configured `PORT` (default: `3000`). It connects to MongoDB before starting to accept requests.

## API

All request and response bodies use JSON unless otherwise noted.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Health check |
| `GET` | `/api/auth/login` | Login route check |
| `GET` | `/api/auth/register` | Registration route check |
| `POST` | `/api/auth/register` | Register a user |
| `POST` | `/api/auth/login` | Check the configured admin username and password |
| `GET` | `/api/users` | List users |
| `PATCH` | `/api/users/:id` | Update a user's address (see implementation note below) |
| `PUT` | `/api/users/:id` | Replace/update a user (see implementation note below) |
| `DELETE` | `/api/users/:id` | Delete a user by `userId` in the request body |

### Health check

```http
GET /health
```

### Register a user

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "name": "Ada Lovelace",
  "age": "36",
  "address": "London",
  "email": "ada@example.com",
  "password": "choose-a-password"
}
```

`name`, `email`, and `password` are required. The password is hashed before it is saved.

### Admin login

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "username": "your_admin_username",
  "password": "your_admin_password"
}
```

The credentials must match `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env`. This is a basic credential check; it does not issue a token or protect the user-management routes.

### List users

```http
GET /api/users
```

### Update a user's address

```http
PATCH /api/users/:id
Content-Type: application/json
```

The current handler reads an `id` property and an `address` property from the JSON body:

```json
{
  "id": "user-id",
  "address": "New address"
}
```

### Delete a user

```http
DELETE /api/users/:id
Content-Type: application/json
```

The current handler looks up the user by `userId` from the JSON body:

```json
{
  "userId": "user-id"
}
```

### Implementation note

The update routes accept a path parameter, but their handlers currently look up a field named `id` in the request body. The `User` model instead defines `userId`, so those handlers will not find registered users as written. The delete handler uses `userId` in the body. These routes should be aligned with the model and path parameter before relying on them.

## Project structure

```text
src/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   ├── authController.js     # Registration and login handlers
│   └── userController.js     # User CRUD handlers
├── models/
│   └── User.js               # Mongoose user schema
├── routes/
│   ├── adminRoutes.js
│   ├── authRoutes.js
│   └── userRoutes.js
└── index.js                  # Express app and route mounting
```

## Available scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the API with Node.js |
| `npm run dev` | Start the API with Nodemon |
