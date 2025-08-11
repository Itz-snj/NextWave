# QuickCourt Admin System

This document describes the comprehensive admin system for QuickCourt, including User Management, Reports & Analytics, and Content Moderation.

## Overview

The admin system provides three main areas of functionality:

1. **User Management** - Manage platform users, roles, and verification
2. **Reports & Analytics** - Comprehensive platform insights and performance metrics
3. **Content Moderation** - Handle user reports and system alerts

## User Management

### Features

- **User Listing**: View all platform users with search and filtering
- **Role Management**: Assign and modify user roles (user, owner, admin)
- **Verification Control**: Verify/unverify user accounts
- **User Statistics**: Track user growth, activity, and demographics
- **User Actions**: Edit user details, delete users, and manage permissions

### API Endpoints

- `GET /api/admin/users` - Fetch all users
- `GET /api/admin/users/stats` - Get user statistics
- `PUT /api/admin/users/[id]` - Update user details
- `DELETE /api/admin/users/[id]` - Delete user
- `PUT /api/admin/users/[id]/verify` - Update user verification status

### Database Schema

```javascript
UserSchema {
  name: String (required)
  email: String (required, unique)
  password: String (required)
  role: String (enum: ['user', 'owner', 'admin'])
  isVerified: Boolean (default: false)
  lastLogin: Date
  createdAt: Date
  updatedAt: Date
}
```

## Reports & Analytics

### Features

- **Revenue Analytics**: Track platform revenue, growth trends, and projections
- **Booking Analytics**: Monitor booking patterns, sport popularity, and venue performance
- **User Analytics**: Analyze user growth, role distribution, and engagement
- **Venue Analytics**: Track venue performance, ratings, and revenue
- **Export Functionality**: Download comprehensive reports as CSV files
- **Time Range Filtering**: Analyze data for different time periods (7, 30, 90, 365 days)

### Analytics Categories

#### Revenue Analytics
- Total revenue and growth percentage
- Monthly revenue trends
- Revenue by venue
- Revenue projections

#### Booking Analytics
- Total bookings and growth
- Bookings by sport type
- Bookings by venue
- Recent booking activity

#### User Analytics
- User growth trends
- User role distribution
- Active user tracking
- User engagement metrics

#### Venue Analytics
- Top performing venues
- Venue status distribution
- Venue ratings and reviews
- Revenue per venue

### API Endpoints

- `GET /api/admin/reports` - Fetch comprehensive analytics data
- `POST /api/admin/reports/export` - Export data as CSV

### Chart Types

- **Line Charts**: Revenue trends, user growth, booking activity
- **Bar Charts**: Revenue by venue, monthly breakdowns
- **Pie Charts**: Sport popularity, user role distribution
- **Area Charts**: Booking activity over time

## Content Moderation

### Features

- **Report Management**: Handle user-submitted reports and content violations
- **Alert System**: Create and manage system-wide alerts and notifications
- **Moderation Actions**: Apply actions to reported content (warn, suspend, ban, remove)
- **Priority Management**: Categorize reports by priority (low, medium, high, critical)
- **Status Tracking**: Track report status (pending, investigating, resolved, dismissed)

### Report Types

- **Venue Reports**: Issues with venue listings or facilities
- **User Reports**: User behavior violations
- **Booking Reports**: Problems with bookings or payments
- **Content Reports**: Inappropriate content or descriptions

### Moderation Actions

- **Warn User**: Send warning notification
- **Suspend Account**: Temporarily suspend user account
- **Ban User**: Permanently ban user from platform
- **Remove Content**: Remove inappropriate content
- **Dismiss Report**: Close report without action

### Alert System

#### Alert Types
- **Warning**: Important notifications requiring attention
- **Info**: General information updates
- **Success**: Positive system updates
- **Error**: Critical system issues

#### Alert Categories
- **System**: Platform-wide system notifications
- **Security**: Security-related alerts
- **Performance**: Performance and maintenance alerts
- **User**: User-related notifications

### API Endpoints

- `GET /api/admin/moderation/reports` - Fetch all reports
- `GET /api/admin/moderation/alerts` - Fetch all alerts
- `GET /api/admin/moderation/stats` - Get moderation statistics
- `POST /api/admin/moderation/alerts` - Create new alert
- `PUT /api/admin/moderation/reports/[id]/action` - Apply action to report
- `PUT /api/admin/moderation/reports/[id]/status` - Update report status
- `PUT /api/admin/moderation/alerts/[id]/toggle` - Toggle alert status
- `DELETE /api/admin/moderation/alerts/[id]` - Delete alert

### Database Schemas

#### Report Schema
```javascript
ReportSchema {
  type: String (enum: ['venue', 'user', 'booking', 'content'])
  reporter: ObjectId (ref: 'User')
  reportedItem: {
    _id: ObjectId
    name: String
    type: String
  }
  reason: String
  description: String
  status: String (enum: ['pending', 'investigating', 'resolved', 'dismissed'])
  priority: String (enum: ['low', 'medium', 'high', 'critical'])
  moderatorNotes: String
  action: String
  createdAt: Date
  updatedAt: Date
}
```

#### Alert Schema
```javascript
AlertSchema {
  type: String (enum: ['warning', 'info', 'success', 'error'])
  title: String
  message: String
  category: String (enum: ['system', 'security', 'performance', 'user'])
  priority: String (enum: ['low', 'medium', 'high', 'critical'])
  isActive: Boolean (default: true)
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}
```

## Security Features

### Access Control
- Admin-only access to all admin pages
- Role-based permissions
- Session validation
- CSRF protection

### Data Protection
- Password hashing for user accounts
- Input validation and sanitization
- SQL injection prevention
- XSS protection

### Audit Trail
- All admin actions are logged
- User modification tracking
- Report action history
- Alert creation and modification logs

## Usage Instructions

### Accessing Admin Panel
1. Navigate to `/admin/dashboard`
2. Ensure you have admin role permissions
3. Use the navigation cards to access different admin sections

### User Management
1. Go to User Management page
2. Use search and filters to find specific users
3. Click edit button to modify user details
4. Use verification toggle to verify/unverify users
5. Use delete button to remove users (with confirmation)

### Reports & Analytics
1. Go to Reports page
2. Select time range for analysis
3. Navigate between different analytics tabs
4. Use export button to download CSV reports
5. View charts and metrics for insights

### Content Moderation
1. Go to Moderation page
2. Review pending reports in Reports tab
3. Apply appropriate actions to reports
4. Manage system alerts in Alerts tab
5. Create new alerts as needed

## Best Practices

### User Management
- Regularly review user accounts
- Verify new user registrations
- Monitor for suspicious activity
- Maintain proper role assignments

### Analytics
- Review reports regularly
- Monitor key performance indicators
- Export data for external analysis
- Track growth trends over time

### Moderation
- Respond to reports promptly
- Apply consistent moderation policies
- Document all moderation actions
- Regular review of alert effectiveness

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure user has admin role
2. **Data Not Loading**: Check database connection
3. **Export Fails**: Verify file permissions and data size
4. **Actions Not Applied**: Check API endpoint availability

### Performance Considerations

- Large datasets may require pagination
- Export functionality for large datasets
- Caching for frequently accessed data
- Database indexing for optimal queries

## Future Enhancements

- Advanced analytics dashboard
- Automated moderation tools
- Bulk user operations
- Advanced reporting features
- Integration with external analytics tools
- Real-time notifications
- Mobile admin interface
