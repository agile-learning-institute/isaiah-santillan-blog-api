# Isaiah Santillan Blog API

A RESTful API for a blog application built with Express.js, Prisma, and PostgreSQL. This API supports blog posts, comments, user authentication, and role-based access control.

## Features

- ✅ **User Authentication** - JWT-based authentication with role-based access control
- ✅ **Blog Posts** - Create, read, update, and delete blog posts with publish/unpublish functionality
- ✅ **Comments** - Public commenting system with moderation capabilities
- ✅ **User Roles** - AUTHOR, ADMIN, and READER roles
- ✅ **RESTful API** - Well-organized REST endpoints
- ✅ **Input Validation** - Comprehensive validation and error handling
- ✅ **Pagination** - Paginated post listings
- ✅ **Slug-based URLs** - SEO-friendly post URLs

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcrypt, helmet, cors

## Setup

1. **Install Dependencies**
   ```bash
   cd api/prisma
   npm install
   ```

2. **Configure Environment Variables**
   ```bash
   cp env.example .env
   ```
   Edit `.env` and set:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `JWT_SECRET` - A strong random string for JWT signing
   - `PORT` - Server port (default: 4000)

3. **Setup Database**
   ```bash
   npm run prisma:generate
   npm run prisma:push
   # or
   npm run prisma:migrate
   ```

4. **Start Server**
   ```bash
   npm run dev    # Development mode with nodemon
   npm start      # Production mode
   ```

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
  ```json
  {
    "email": "user@example.com",
    "username": "username",
    "password": "password123"
  }
  ```

- `POST /auth/login` - Login and receive JWT token
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

### Posts

- `GET /posts` - Get all posts (paginated, public sees only published)
  - Query params: `?page=1&limit=10&published=false` (for authenticated authors)
  
- `GET /posts/:slug` - Get a single post by slug (public, published only)

- `GET /posts/id/:id` - Get a single post by ID (protected, for admin panel)

- `POST /posts` - Create a new post (protected, requires authentication)
  ```json
  {
    "title": "My Blog Post",
    "content": "Post content here...",
    "published": false
  }
  ```

- `PUT /posts/:id` - Update a post (protected, author or admin only)
  ```json
  {
    "title": "Updated Title",
    "content": "Updated content...",
    "published": true
  }
  ```

- `DELETE /posts/:id` - Delete a post (protected, author or admin only)

### Comments

- `POST /comments/:postId` - Create a comment (public, on published posts only)
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "content": "Great post!"
  }
  ```

- `GET /comments/post/:postId` - Get comments for a post (public, published only)

- `GET /comments` - Get all comments (protected, admin/author only)
  - Query params: `?postId=1&published=true`

- `GET /comments/:id` - Get a single comment (protected)

- `PUT /comments/:id` - Update/moderate a comment (protected, admin/author only)
  ```json
  {
    "content": "Updated comment",
    "published": false
  }
  ```

- `DELETE /comments/:id` - Delete a comment (protected, admin/author only)

### Users

- `GET /users` - Get all users (protected, admin only)

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

The JWT token is returned when you register or login. Store it in localStorage on the client side and include it in all authenticated requests.

## User Roles

- **READER** - Can read published posts and comment
- **AUTHOR** - Can create, edit, and delete their own posts
- **ADMIN** - Full access to all posts and comments

## Database Schema

### User
- `id` - Primary key
- `email` - Unique email address
- `username` - Optional username
- `password` - Hashed password
- `role` - User role (READER, AUTHOR, ADMIN)
- `createdAt`, `updatedAt` - Timestamps

### Post
- `id` - Primary key
- `title` - Post title
- `slug` - Unique URL-friendly identifier
- `content` - Post content
- `published` - Publication status
- `publishedAt` - Publication timestamp
- `authorId` - Foreign key to User
- `createdAt`, `updatedAt` - Timestamps

### Comment
- `id` - Primary key
- `name` - Commenter name (optional)
- `email` - Commenter email (optional)
- `content` - Comment content
- `published` - Moderation status
- `postId` - Foreign key to Post
- `createdAt` - Timestamp

## Project Structure

```
api/prisma/
├── src/
│   ├── index.js          # Main Express app
│   ├── routes/           # Route handlers
│   │   ├── auth.js       # Authentication routes
│   │   ├── posts.js      # Post routes
│   │   ├── comments.js   # Comment routes
│   │   └── users.js      # User routes
│   ├── middleware/       # Express middleware
│   │   └── auth.js       # JWT authentication middleware
│   └── utils/            # Utility functions
│       └── jwt.js        # JWT helper functions
├── schema.prisma         # Prisma schema
└── package.json          # Dependencies
```

## Frontend Applications

This project includes two separate frontend applications:

### Public Blog (`/client`)
A React application for readers to view blog posts and leave comments.

**Features:**
- View all published posts with pagination
- Read individual posts
- Leave comments on posts
- Responsive design

**Setup:**
```bash
cd client
npm install
npm run dev  # Runs on http://localhost:3000
```

### Admin Panel (`/admin`)
A React application for authors/admins to manage blog content.

**Features:**
- JWT authentication
- Create, edit, and delete posts
- Publish/unpublish posts
- Moderate comments (publish/unpublish, delete)
- View all posts with status indicators

**Setup:**
```bash
cd admin
npm install
npm run dev  # Runs on http://localhost:3001
```

## Running the Full Stack

1. **Start the API:**
   ```bash
   cd api/prisma
   npm install
   npm run dev  # Runs on http://localhost:4000
   ```

2. **Start the Public Blog:**
   ```bash
   cd client
   npm install
   npm run dev  # Runs on http://localhost:3000
   ```

3. **Start the Admin Panel:**
   ```bash
   cd admin
   npm install
   npm run dev  # Runs on http://localhost:3001
   ```

## License

MIT