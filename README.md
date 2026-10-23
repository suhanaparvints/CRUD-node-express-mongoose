# CRUD Node, Express, and Mongoose API

A REST API for registering and authenticating users, then managing their records in MongoDB. It uses Express, Mongoose, Joi request validation, bcrypt password hashing, and JSON Web Tokens (JWT) for protected endpoints.

## Features

- Register users and authenticate as a user or admin
- List, update, and delete user records
- Validate request bodies and user IDs
- Hash passwords with bcrypt and omit them from API responses
- Connect to MongoDB with Mongoose
- Health-check endpoint

## Requirements

- Node.js compatible with Mongoose 9
- npm
- MongoDB, locally or hosted

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root. Use `.env.example` as a reference:

   ```env
   PORT=4200
   MONGODB_URI=mongodb://localhost:27017
   DATABASE=crud
   JWT_SECRET=replace-with-a-long-random-secret
   ```

   `PORT` is optional and defaults to `3000`. `MONGODB_URI`, `DATABASE`, and `JWT_SECRET` must be set. Keep `.env` private; it is excluded from Git.

3. Start MongoDB, then start the API:

   ```bash
   npm run dev
   ```

   For a regular start without Nodemon:

   ```bash
   npm start
   ```

The server connects to MongoDB before it begins listening. Unless configured otherwise, the API is available at `http://localhost:3000`.

## API

All endpoints accept and return JSON where a request or response body is used. The examples below use `http://localhost:4200`; replace this with your configured port or deployed API URL.

| Method   | Endpoint               | Authentication              | Description                                                           |
| -------- | ---------------------- | --------------------------- | --------------------------------------------------------------------- |
| `GET`    | `/health`              | None                        | Check that the server is running and see the connected database name. |
| `POST`   | `/api/auth/register`   | None                        | Register a user.                                                      |
| `POST`   | `/api/users/login`     | None                        | Log in as a user and receive a user JWT.                              |
| `POST`   | `/api/admin/login`     | None                        | Log in as an admin and receive an admin JWT.                          |
| `PATCH`  | `/api/users/:id`       | Any valid user or admin JWT | Update a user's name.                                                 |
| `PUT`    | `/api/users/:id`       | Any valid user or admin JWT | Replace a user's name, age, address, email, and password.             |
| `GET`    | `/api/admin/users`     | Admin JWT                   | List all users.                                                       |
| `PUT`    | `/api/admin/users/:id` | Admin JWT                   | Replace a user's name, age, address, email, and password.             |
| `DELETE` | `/api/admin/users/:id` | Admin JWT                   | Delete a user.                                                        |

For protected endpoints, include the JWT returned by the appropriate login endpoint in the `Authorization` request header.

The user login token expires after one hour; the admin login token expires after one day. A user ID (`:id`) is the UUID returned as `data.userId` when registering a user.

### Health check

```http
GET /health
```

Example response:

```json
{
  "status": "OK",
  "message": "success health check",
  "database": "crud"
}
```

### Register a user

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "password": "Passw0rd!",
  "age": 36,
  "address": "London"
}
```

`name`, `email`, and `password` are required. Names must be 3–50 letters and spaces. Passwords must be at least 6 characters and include an uppercase letter, a lowercase letter, a number, and one of `@$!%*?&`. `age` is optional (10–80), as is `address` (at least 5 characters). The optional `role` accepts `user` or `admin`; if omitted, it defaults to `user`.

Successful registration returns `201 Created` and the new user ID:

```json
{
  "status": "OK",
  "message": "User registered successfully",
  "data": {
    "userId": "019..."
  }
}
```

### Log in

User login:

```http
POST /api/users/login
Content-Type: application/json
```

Admin login:

```http
POST /api/admin/login
Content-Type: application/json
```

Both endpoints accept an email and password:

```json
{
  "email": "ada@example.com",
  "password": "Passw0rd!"
}
```

Admin login requires an account whose role is `admin`. Successful login returns a JWT in the `token` field. Do not share or expose this token.

### Update a user's name

```http
PATCH /api/users/<userId>
Content-Type: application/json
```

```json
{
  "name": "Ada Byron"
}
```

The name must contain 1–100 characters. Any valid user or admin token is accepted; this endpoint does not check that the authenticated account owns the target user ID.

### Replace a user's editable fields

The user and admin `PUT` endpoints accept the same request body:

```http
PUT /api/users/<userId>
Content-Type: application/json
```

```json
{
  "name": "Ada Byron",
  "age": 37,
  "address": "London",
  "email": "ada@example.com",
  "password": "NewPassw0rd!"
}
```

All five fields are required. `name` must contain 1–100 characters, `age` must be an integer from 1–150, `address` must contain 1–300 characters, and `password` must contain 6–128 characters. The new password is hashed before storage. The user endpoint requires a valid user or admin token; the admin endpoint requires an admin token.

### List users

```http
GET /api/admin/users
```

Returns all user records in a `data` array. Passwords are not included in user responses.

### Delete a user

```http
DELETE /api/admin/users/<userId>
```

No request body is required. The endpoint returns `200 OK` when the deletion request completes.

## Responses and errors

Responses use JSON. Common HTTP statuses include:

| Status                      | Meaning                                                                                        |
| --------------------------- | ---------------------------------------------------------------------------------------------- |
| `200 OK`                    | Request succeeded, such as login or an update.                                                 |
| `201 Created`               | User registered successfully.                                                                  |
| `400 Bad Request`           | Required data is missing or validation failed. Validation responses include a `details` array. |
| `401 Unauthorized`          | Credentials are invalid or the authorization header is missing.                                |
| `403 Forbidden`             | The token is invalid or expired, or the account does not have the required role.               |
| `404 Not Found`             | A requested user was not found on endpoints that check for a missing user.                     |
| `409 Conflict`              | The email address is already registered.                                                       |
| `500 Internal Server Error` | The server could not complete the request.                                                     |

## Project structure

```text
src/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   ├── authController.js     # Registration and login handlers
│   └── userController.js     # User management handlers
├── middleware/
│   ├── authMiddleware.js     # JWT and role checks
│   └── validate.js           # Request validation middleware
├── models/
│   └── User.js               # Mongoose user schema
├── routes/
│   ├── adminRoutes.js
│   ├── authRoutes.js
│   └── userRoutes.js
├── validators/
│   ├── authValidators.js
│   └── userValidators.js
└── index.js                  # Express app and route mounting
```

## Available scripts

| Command                | Description                         |
| ---------------------- | ----------------------------------- |
| `npm start`            | Start the API with Node.js.         |
| `npm run dev`          | Start the API with Nodemon.         |
| `npm run format`       | Format project files with Prettier. |
| `npm run format:check` | Check formatting with Prettier.     |
