# 🎬 SnapCast - Screen Recording & Video Sharing Platform

A modern, full-featured screen recording and video sharing application built with Next.js 15, inspired by Loom. SnapCast allows users to record their screens, upload videos, and share them with others in a beautiful, intuitive interface.

![SnapCast Home Page](public/assets/readme/SnapCast%20Home%20Page.png)

## ✨ Features

### 🎥 Screen Recording

-   **Real-time screen capture** with audio support
-   **Microphone integration** for voice-over recording
-   **High-quality recording** with configurable video settings (1080p, 30fps)
-   **Recording duration tracking** and preview functionality
-   **WebM format** with VP9/Opus codecs for optimal compression

### 📤 Video Management

-   **Drag & drop video uploads** with file validation
-   **Custom thumbnail uploads** for better video presentation
-   **Video processing status** tracking with progress indicators
-   **Public/Private visibility** controls
-   **Video metadata** management (title, description, duration)
-   **View count tracking** and analytics

### 🔐 Authentication & User Management

-   **Google OAuth integration** using Better Auth
-   **Secure session management** with PostgreSQL storage
-   **User profiles** with personalized video libraries
-   **Rate limiting** protection with Arcjet

### 🎨 Modern UI/UX

-   **Responsive design** that works on all devices
-   **Dark/Light theme** support with Tailwind CSS
-   **Smooth animations** and transitions
-   **Intuitive navigation** with clean, modern interface
-   **Video grid layout** with search and filtering

### 🚀 Performance & Infrastructure

-   **Bunny.net CDN** integration for fast video delivery
-   **PostgreSQL database** with Drizzle ORM
-   **Server-side rendering** with Next.js App Router
-   **Optimized video streaming** and thumbnail generation
-   **Automatic transcription** support

## 🖼️ Screenshots

<details>
<summary>View All Screenshots</summary>

### Authentication Page

![Auth Page](public/assets/readme/SnapCast%20Auth%20Page.png)

### Video Details Page

![Details Page](public/assets/readme/SnapCast%20Details%20Page.png)

### User Profile Page

![Profile Page](public/assets/readme/SnapCast%20Profile%20Page.png)

### Upload Page

![Upload Page](public/assets/readme/SnapCast%20Upload%20Page.png)

</details>

## 🛠️ Tech Stack

### Frontend

-   **Next.js 15** - React framework with App Router
-   **React 19** - Latest React with concurrent features
-   **TypeScript** - Type-safe development
-   **Tailwind CSS 4** - Utility-first CSS framework
-   **Custom Fonts** - Satoshi and Karla font families

### Backend & Database

-   **PostgreSQL** - Primary database
-   **Drizzle ORM** - Type-safe database toolkit
-   **Better Auth** - Modern authentication solution
-   **Server Actions** - Next.js server-side functions

### Media & CDN

-   **Bunny.net** - Video streaming and storage CDN
-   **WebRTC** - Screen recording APIs
-   **MediaRecorder API** - Browser-native recording

### Security & Performance

-   **Arcjet** - Rate limiting and security
-   **Environment Variables** - Secure configuration
-   **CORS Protection** - Cross-origin security

## 🚀 Getting Started

### Prerequisites

-   Node.js 18+
-   PostgreSQL database
-   Bunny.net account (for video CDN)
-   Google OAuth credentials

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/amaan-ur-raheman/snap-cast-video-sharing-app.git
cd snapcast
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env.local
```

Fill in your environment variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/snapcast"

# Authentication
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Bunny.net CDN
BUNNY_LIBRARY_ID="your-bunny-library-id"
BUNNY_STREAM_ACCESS_KEY="your-stream-access-key"
BUNNY_STORAGE_ACCESS_KEY="your-storage-access-key"
```

4. **Set up the database**

```bash
npm run db:push
```

5. **Start the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
snapcast/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (root)/            # Main application pages
│   └── api/               # API routes
├── components/            # Reusable UI components
├── lib/                   # Utility functions and hooks
│   ├── actions/           # Server actions
│   └── hooks/             # Custom React hooks
├── drizzle/              # Database schema and config
├── constants/            # Application constants
├── fonts/                # Custom font files
└── public/               # Static assets
```

## 🎯 Key Features Explained

### Screen Recording

The app uses the modern WebRTC APIs to capture screen content with audio. The recording system supports:

-   Multiple audio sources (system audio + microphone)
-   Real-time audio mixing using Web Audio API
-   Configurable video quality settings
-   Automatic cleanup of media streams

### Video Processing

Videos are processed through Bunny.net's infrastructure:

-   Automatic transcoding to multiple formats
-   Thumbnail generation from video frames
-   Global CDN distribution for fast playback
-   Processing status tracking with real-time updates

### Database Design

The application uses a normalized PostgreSQL schema with:

-   User authentication and session management
-   Video metadata with relationships
-   View tracking and analytics
-   Proper foreign key constraints and cascading deletes

## 🔧 Available Scripts

-   `npm run dev` - Start development server with Turbopack
-   `npm run build` - Build for production
-   `npm run start` - Start production server
-   `npm run lint` - Run ESLint
-   `npm run db:push` - Push database schema changes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

-   [Next.js](https://nextjs.org/) for the amazing React framework
-   [Bunny.net](https://bunny.net/) for reliable video CDN services
-   [Better Auth](https://better-auth.com/) for modern authentication
-   [Drizzle ORM](https://orm.drizzle.team/) for type-safe database operations
-   [Tailwind CSS](https://tailwindcss.com/) for utility-first styling

---

Built with ❤️ by Amaan Ur Raheman - Feel free to ⭐ this repository if you found it helpful!
