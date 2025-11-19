# Blog Admin - Admin Panel

The admin panel for managing blog posts and comments.

## Features

- 🔐 Authentication with JWT
- ✍️ Create, edit, and delete blog posts
- 📝 Publish/unpublish posts
- 💬 Moderate comments (publish/unpublish, delete)
- 📊 View all posts with status indicators
- 🎨 Clean and intuitive interface

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure API URL** (optional)
   Create a `.env` file:
   ```
   VITE_API_URL=http://localhost:4000
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3001`

4. **Build for Production**
   ```bash
   npm run build
   ```

## Usage

1. Start the API server first (port 4000)
2. Start the admin panel (port 3001)
3. Login with your author/admin credentials
4. Manage your posts and comments

## Tech Stack

- React 18
- React Router
- Vite
- Modern CSS

