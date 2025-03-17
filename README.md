# Locarater - Location Rating Platform

## 🎯 Project Overview

Locarater is a comprehensive platform where users can discover, rate, and review various locations. Users can contribute by adding new locations and sharing their experiences, creating a dynamic community-driven ecosystem for location-based recommendations.

## 🏗 Technical Stack

### Frontend

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS 4
- Zustand 5
- Axios
- Formik & Yup
- date-fns
- Lucide React
- Radix UI Components
- Headless UI
- Next Themes

### Backend

- Node.js
- Express
- TypeScript
- MongoDB & Mongoose
- JWT Authentication
- Bcrypt
- Nodemailer
- Multer
- Supabase Storage

## 👥 User Roles

### 1. Visitor

- View locations
- Search functionality
- Apply filters
- View location details

### 2. Registered User

- Create and edit profile
- Add new locations
- Rate and review locations
- Email verification system
- Manage their added locations
- Like, dislike and comment on feed items
- Earn badges and view badge notifications

### 3. Admin

- Manage all content
- User management
- Configure site settings
- Moderate location submissions

## 📱 Features

### Location Management

- Community-driven location submissions
- Add/edit/delete locations by users
- Category system

### Rating System

- Star rating
- Written reviews
- Like/dislike functionality
- Comment system
- Review reporting

### Social Feed System

- Activity feed with location additions
- Review posts from followed users
- Badge achievement notifications
- Social interactions (likes, dislikes, comments)
- Comment counter display
- Content reporting

### Search and Filtering

- Text-based search
- Category filters
- Rating filters
- Sorting options

### User Profile

- Profile customization
- Review history
- Favorite locations
- Notification preferences
- Email verification

### Dashboard

- Location statistics
- Review management
- Profile settings
- Notifications

## 📁 Project Structure

```
.
├── apps
│   ├── api
│   │   ├── src
│   │   │   ├── controllers
│   │   │   ├── hooks
│   │   │   ├── index.ts
│   │   │   ├── middleware
│   │   │   ├── models
│   │   │   ├── public
│   │   │   ├── routes
│   │   │   ├── scripts
│   │   │   ├── seeds
│   │   │   ├── services
│   │   │   ├── types
│   │   │   └── utils
│   └── web
│       ├── public
│       ├── src
│       │   ├── app
│       │   ├── assets
│       │   ├── components
│       │   ├── config
│       │   ├── constants
│       │   ├── hooks
│       │   ├── lib
│       │   ├── providers
│       │   ├── services
│       │   ├── store
│       │   └── types
```

## 🚀 Development Progress

### 1. Core Infrastructure

- [x] Project setup
- [x] Backend API
- [x] Frontend structure
- [x] Authentication system
- [x] Email verification

### 2. Location System

- [x] Location CRUD operations
- [x] User-driven location submissions
- [ ] Photo upload
- [x] Search and filtering
- [ ] Location moderation

### 3. Rating System

- [x] Comments and ratings
- [x] Like system
- [x] Response system
- [x] Reporting

### 4. Social Feed System

- [x] Activity feed
- [x] Review posts
- [x] Badge notifications
- [x] Post interactions (likes, dislikes)
- [x] Comment system
- [x] Interaction counters

### 5. User System

- [x] Profile management
- [x] User authentication
- [x] Email verification
- [ ] Favorites
- [ ] Notifications
- [ ] Settings

### 6. Dashboard & Admin

- [x] Location management
- [x] Statistics
- [x] User management
- [ ] Site settings

## 🛠 Getting Started

### Prerequisites

- Node.js 18.x
- MongoDB
- Supabase
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/afurgapil/locarater.git
cd locarater
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
# Create .env files in both apps/web and apps/api directories
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env
```

4. Start development servers

```bash
npm run dev
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
