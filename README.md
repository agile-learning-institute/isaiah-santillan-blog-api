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
- ✅ **Clean Architecture** - Separation of concerns with models, services, and validators
- ✅ **Comprehensive Testing** - Full test suite with 91+ tests covering all layers

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcrypt, helmet, cors
- **Testing**: Jest, Supertest

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

5. **Run Tests** (Optional)
   ```bash
   npm test              # Run all tests
   npm run test:watch    # Watch mode
   npm run test:coverage # Generate coverage report
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


### Architecture Layers

- **Routes**: Thin HTTP handlers that delegate to services
- **Services**: Business logic and orchestration
- **Models**: Data access abstraction (Prisma operations)
- **Validators**: Input validation and sanitization
- **Middleware**: Authentication and authorization

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

## Testing

The project includes a comprehensive test suite with 91+ tests covering all layers of the application.

### Running Tests

```bash
cd api/prisma

# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Structure

- **Validators**: Test input validation logic
- **Services**: Test business logic with mocked models
- **Routes**: Integration tests for HTTP endpoints
- **Utils**: Test utility functions

### Test Coverage

The test suite covers:
- ✅ All validators (auth, post, comment)
- ✅ All services (auth, post, comment, user)
- ✅ All route endpoints
- ✅ Utility functions
- ✅ Error handling and edge cases

## Development

### Code Organization

The codebase follows clean architecture principles:

- **Separation of Concerns**: Each layer has a single responsibility
- **Testability**: Services and models can be tested independently
- **Maintainability**: Changes are isolated to specific layers
- **Reusability**: Services can be used across different parts of the application

### Adding New Features

1. **Create/Update Model** (`src/models/`) - Add data access methods
2. **Create/Update Validator** (`src/validators/`) - Add validation logic
3. **Create/Update Service** (`src/services/`) - Add business logic
4. **Create/Update Route** (`src/routes/`) - Add HTTP endpoints
5. **Write Tests** (`tests/`) - Add tests for new functionality

## Future Enhancements

- Add rate limiting
- Add image upload support
- Add rich text editor (TinyMCE, etc.)
- Add email notifications for comments
- Add search functionality
- Add post categories/tags
- Add RSS feed

## License

MIT