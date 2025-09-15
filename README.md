# Quiet Hours Scheduler

A focused study session scheduler built with Next.js, Supabase, and MongoDB. Students can create quiet study time blocks and receive email reminders 10 minutes before each session starts.

## Features

- **User Authentication**: Secure sign-up and login with Supabase Auth
- **Study Block Management**: Create, view, and delete study sessions
- **Email Notifications**: Automated reminders sent 10 minutes before study sessions
- **Conflict Prevention**: Smart scheduling prevents overlapping study blocks
- **Notification Tracking**: Monitor email delivery status and history
- **Responsive Design**: Clean, calming interface optimized for focus

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Authentication**: Supabase Auth with Row Level Security
- **Database**: Supabase (PostgreSQL) for study blocks, MongoDB for notification queue
- **Email**: Simulated email service (ready for integration with Resend, SendGrid, etc.)
- **Deployment**: Vercel with cron jobs for automated notifications

## Getting Started

### Prerequisites

- Node.js 18+ 
- Supabase project
- MongoDB database
- Vercel account (for deployment)

### Environment Variables

Create a `.env.local` file with:

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Cron Security
CRON_SECRET=your_secure_random_string

# Email (optional - for production)
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@yourdomain.com

# Development redirect URL
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
\`\`\`

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your Supabase database by running the SQL script in `scripts/001_create_study_blocks_table.sql`
4. Start the development server: `npm run dev`

### Deployment

1. Deploy to Vercel
2. Add environment variables in Vercel dashboard
3. The cron job will automatically run every 5 minutes to process notifications

## Architecture

- **Study blocks** are stored in Supabase with RLS policies
- **Notification queue** is managed in MongoDB for reliable email processing
- **Cron jobs** run every 5 minutes to send pending notifications
- **Email logs** track delivery status and failures

## Security

- Row Level Security (RLS) ensures users can only access their own data
- Cron endpoints are protected with bearer token authentication
- All user inputs are validated and sanitized

## Contributing

This project was built as a technical assessment. Feel free to fork and extend it for your own use cases.
