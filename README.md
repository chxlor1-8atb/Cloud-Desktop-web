# ☁️ Cloud Desktop

A modern cloud storage web application built with Next.js and Google Drive API.

![Cloud Desktop](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- 🔐 **Authentication** - Google OAuth & Email OTP login
- 📁 **File Management** - Upload, download, and delete files
- 📂 **Folder Navigation** - Create folders and navigate through directories
- 🔍 **Search** - Quick file search functionality
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎨 **Modern UI** - Beautiful dark theme with glassmorphism effects
- ☁️ **Google Drive Integration** - Files stored securely on Google Drive

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Google Cloud Console project with Drive API enabled
- Gmail account for SMTP (optional, for OTP)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cloud-desktop-web.git
cd cloud-desktop-web
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:

Create a `.env.local` file with the following:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Google Drive
GOOGLE_DRIVE_FOLDER_ID=your-folder-id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Gmail SMTP (for OTP)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts
│   │   │   └── send-otp/route.ts
│   │   ├── files/
│   │   │   ├── [id]/route.ts
│   │   │   └── route.ts
│   │   ├── storage/route.ts
│   │   └── upload/route.ts
│   ├── dashboard/
│   │   ├── dashboard.module.css
│   │   └── page.tsx
│   ├── login/
│   │   ├── login.module.css
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.module.css
│   └── page.tsx
├── components/
│   └── providers/
│       └── AuthProvider.tsx
├── lib/
│   ├── auth.ts
│   ├── email.ts
│   └── google-drive.ts
├── types/
│   └── next-auth.d.ts
└── middleware.ts
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Authentication**: NextAuth.js
- **Cloud Storage**: Google Drive API
- **Email**: Nodemailer with Gmail SMTP
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Styling**: CSS Modules

## 📝 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/send-otp` | POST | Send OTP to email |
| `/api/files` | GET | List files in folder |
| `/api/files` | POST | Create new folder |
| `/api/files/[id]` | GET | Get file details |
| `/api/files/[id]` | DELETE | Delete file |
| `/api/upload` | POST | Upload file |
| `/api/storage` | GET | Get storage quota |

## 🔒 Security

- JWT-based authentication
- Service account for Google Drive operations
- Environment variables for sensitive data
- Protected API routes

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
