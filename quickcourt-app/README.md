# NextWave - Sports Facility Booking Platform

NextWave is a comprehensive full-stack web application built with Next.js that enables sports enthusiasts to discover, book, and manage sports facilities. The platform serves three types of users: regular users who book facilities, facility owners who manage their venues, and administrators who oversee the entire platform.

## Features

### For Users
- **Venue Discovery**: Browse and search sports facilities with advanced filters
- **Easy Booking**: Real-time availability checking and instant booking
- **Booking Management**: View, manage, and cancel bookings
- **User Profiles**: Manage personal information and preferences

### For Facility Owners
- **Dashboard Analytics**: Comprehensive insights with charts and KPIs
- **Facility Management**: Add and manage sports facilities
- **Court Management**: Configure courts, pricing, and availability
- **Booking Overview**: Monitor all bookings and customer interactions

### For Administrators
- **Platform Overview**: Global statistics and performance metrics
- **Facility Approvals**: Review and approve new facility registrations
- **User Management**: Monitor and manage all platform users
- **Analytics Dashboard**: Platform-wide insights and trends

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Charts**: Recharts for data visualization
- **Authentication**: Custom JWT-based auth system
- **State Management**: React Context API
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd nextwave-app
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Demo Credentials

Use these credentials to test different user roles:



## Project Structure

\`\`\`
quickcourt-app/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── venues/            # Venue browsing and details
│   ├── booking/           # Booking flow
│   ├── bookings/          # User booking management
│   ├── owner/             # Facility owner dashboard
│   ├── admin/             # Admin dashboard
│   ├── profile/           # User profile management
│   └── api/               # API routes
├── components/            # Reusable UI components
│   └── ui/               # shadcn/ui components
├── contexts/             # React contexts
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
└── public/               # Static assets
\`\`\`

## Key Features Implemented

### Authentication System
- User registration with role selection
- Email/password login
- OTP verification (simulated)
- Role-based access control

### Booking System
- Real-time availability checking
- Time slot selection
- Duration-based pricing
- Mock payment processing
- Booking confirmation and management

### Dashboard Analytics
- Interactive charts using Recharts
- KPI widgets and metrics
- Booking trends and revenue tracking
- User growth analytics

### Responsive Design
- Mobile-first approach
- Tailwind CSS for styling
- shadcn/ui component library
- Modern, clean interface

## API Routes

- `POST /api/auth/login` - User authentication
- `POST /api/auth/signup` - User registration

## Future Enhancements

- Real database integration (MongoDB/PostgreSQL)
- Actual payment gateway integration
- Real-time notifications
- Advanced search and filtering
- Mobile app development
- Email notification system
- Review and rating system
- Multi-language support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
