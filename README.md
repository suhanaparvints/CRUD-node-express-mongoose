# CRUD Node, Express, and MongoDB API

A REST API for registering users and managing user records. It is built with Node.js, Express, and Mongoose, stores data in MongoDB, hashes passwords with bcrypt, and uses JSON Web Tokens (JWT) to protect routes.

## Features

- User registration and login
- Admin login using environment-configured credentials
- List, update, and delete user records
- Password hashing with bcrypt
- Request validation and UUID-based user IDs
- Health-check endpoint
- CORS and Helmet middleware

## Requirements

- Node.js (LTS recommended)
- npm
- MongoDB (local or hosted)

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and set the values for your environment:

   ```env
   PORT=4200
   MONGODB_URI=mongodb://localhost:27017
   DATABASE=CRUD1
   JWT_SECRET=replace-with-a-long-random-secret
   ADMIN_USERNAME=your_admin_username
   ADMIN_PASSWORD=your_admin_password
   ```

   `JWT_SECRET` is used to sign and verify authentication tokens. Use a long, unpredictable value. Keep `.env` private; it is excluded from Git.

3. Make sure MongoDB is running, then start the API:

   ```bash
   npm run dev
   ```

   Or start it without the development watcher:

   ```bash
   npm start
   ```

The server connects to MongoDB before listening. It uses the `PORT` value from `.env`, or `3000` if `PORT` is not set.

## API

All request and response bodies use JSON unless noted otherwise. The examples use `http://localhost:4200`; replace it with your deployed API URL or configured port.

| Method   | Path                 | Authentication      | Description                              |
| -------- | -------------------- | ------------------- | ---------------------------------------- |
| `GET`    | `/health`            | None                | Check that the server is running         |
| `POST`   | `/api/auth/register` | None                | Register a user                          |
| `POST`   | `/api/auth/login`    | None                | Log in as a registered user              |
| `POST`   | `/api/admin/login`   | None                | Log in with configured admin credentials |
| `GET`    | `/api/users`         | Admin token         | List users                               |
| `PATCH`  | `/api/users/:id`     | User token | Update a user's name                     |
| `PUT`    | `/api/users/:id`     | Admin token         | Replace a user's editable fields         |
| `DELETE` | `/api/users/:id`     | Admin token         | Delete a user                            |

For protected endpoints, send the token returned by login in the `Authorization` header:

```http
Authorization: Bearer <token>
```

### Health check

```http
GET /health
```

Returns a successful status when the server is running:

```json
{
  "status": "OK",
  "message": "success health check"
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

`name`, `email`, and `password` are required. The name must contain 3–50 letters and spaces. The password must be at least 6 characters and include an uppercase letter, a lowercase letter, a number, and one of `@$!%*?&`. `age` (10–80) and `address` (at least 5 characters) are optional.

On success, the response includes the new user's UUID in `data.userId`. Use this value as `:id` in user-management endpoints.

### Log in as a user

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "ada@example.com",
  "password": "Passw0rd!"
}
```

The successful response contains a JWT in `token`. User tokens expire after one day.

### Log in as an admin

```http
POST /api/admin/login
Content-Type: application/json
```

```json
{
  "username": "your_admin_username",
  "password": "your_admin_password"
}
```

The credentials must match `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env`. The response contains an admin JWT in `token`; admin tokens expire after one day. Use this token for the admin-only `GET /api/users`, `PUT`, and `DELETE` endpoints.

### List users

```http
GET /api/users
Authorization: Bearer <user-or-admin-token>
```

Only an admin token is accepted. A valid user token without the admin role receives `403 Forbidden`. The response contains the user records stored in the database.

### Update a user's name

```http
PATCH /api/users/<userId>
Authorization: Bearer <user-or-admin-token>
Content-Type: application/json
```

```json
{
  "name": "Ada Byron"
}
```

The `name` field is required. Any valid user token is accepted; this route does not restrict updates to the authenticated user's own account.

### Replace a user's editable fields

```http
PUT /api/users/<userId>
Authorization: Bearer <admin-token>
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

All fields shown are required. `age` must be an integer from 1 to 150, `name` must be 1–100 characters, `address` must be 1–300 characters, and `password` must be 6–128 characters. The new password is hashed before it is saved.

### Delete a user

```http
DELETE /api/users/<userId>
Authorization: Bearer <admin-token>
```

No request body is required.

### Errors

Validation failures and unsuccessful operations return a JSON error response. Missing or invalid authentication returns `401` or `403`; invalid request data generally returns `400`.

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

| Command                | Description                        |
| ---------------------- | ---------------------------------- |
| `npm start`            | Start the API with Node.js         |
| `npm run dev`          | Start the API with Nodemon         |
| `npm run format`       | Format project files with Prettier |
| `npm run format:check` | Check formatting with Prettier     |
