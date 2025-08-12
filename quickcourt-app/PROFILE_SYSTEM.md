# Enhanced Profile System Documentation

This document describes the enhanced user profile system for QuickCourt, including phone numbers, location, bio, profile photos, and preferences management.

## 🚀 Features

### Core Profile Fields
- **Name** - User's full name
- **Email** - Primary email address (read-only)
- **Phone** - Contact phone number
- **Location** - User's city/state/country
- **Bio** - Personal description
- **Avatar** - Profile photo with upload capability

### User Preferences
- **Email Notifications** - Toggle for email updates
- **SMS Notifications** - Toggle for text messages
- **Privacy Level** - Public, Friends, or Private

### Security Features
- **Profile Photo Validation** - File type and size restrictions
- **Secure File Storage** - Organized upload directory structure
- **Database Integration** - Persistent storage with MongoDB

## 🗄️ Database Schema

### User Collection Updates
```javascript
const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'owner', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  
  // Enhanced profile fields
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    privacyLevel: { type: String, enum: ['public', 'friends', 'private'], default: 'public' }
  }
}, { timestamps: true });
```

## 🔧 API Endpoints

### 1. Update Profile
```http
PUT /api/profile/update
Content-Type: application/json

{
  "userId": "user_id_here",
  "profileData": {
    "name": "John Doe",
    "phone": "+1 (555) 123-4567",
    "location": "New York, NY",
    "bio": "Sports enthusiast",
    "preferences": {
      "emailNotifications": true,
      "smsNotifications": false,
      "privacyLevel": "public"
    }
  }
}
```

### 2. Upload Avatar
```http
POST /api/profile/upload-avatar
Content-Type: multipart/form-data

Form Data:
- userId: "user_id_here"
- avatar: [image_file]
```

## 📁 File Upload System

### Directory Structure
```
public/
└── uploads/
    └── avatars/
        ├── avatar_user123_1234567890.jpg
        ├── avatar_user456_1234567891.png
        └── ...
```

### File Validation
- **Allowed Types**: JPEG, JPG, PNG, WebP
- **Maximum Size**: 5MB
- **Naming Convention**: `avatar_{userId}_{timestamp}.{extension}`

### Security Features
- File type validation
- Size limit enforcement
- Unique filename generation
- Organized storage structure

## 🎨 Frontend Components

### Profile Page Features
- **Progressive Editing** - Fields appear as needed
- **Real-time Validation** - Immediate feedback
- **Photo Upload** - Drag & drop or click to upload
- **Preferences Management** - Toggle switches and dropdowns
- **Responsive Design** - Mobile-first approach

### UI Components Used
- `Card` - Profile sections
- `Input` - Text fields
- `Textarea` - Bio field
- `Select` - Privacy level dropdown
- `Switch` - Toggle preferences
- `Button` - Actions and navigation

## 🔄 State Management

### Local State
```javascript
const [profileData, setProfileData] = useState({
  name: "",
  email: "",
  phone: "",
  location: "",
  avatar: "",
  bio: "",
  preferences: {
    emailNotifications: true,
    smsNotifications: false,
    privacyLevel: 'public'
  }
})
```

### Context Integration
- **AuthContext** - User data and update functions
- **Local Storage** - Persistent user preferences
- **Real-time Updates** - Immediate UI reflection

## 🧪 Testing

### Manual Testing Steps
1. **Navigate to Profile Page**
   - Go to `/profile`
   - Verify all fields display correctly

2. **Edit Profile Information**
   - Click "Edit Profile"
   - Modify name, phone, location, bio
   - Save changes
   - Verify database update

3. **Upload Profile Photo**
   - Click camera icon on avatar
   - Select image file
   - Verify upload success
   - Check file storage

4. **Manage Preferences**
   - Toggle notification settings
   - Change privacy level
   - Save preferences
   - Verify persistence

### API Testing
```bash
# Test profile update
curl -X PUT http://localhost:3000/api/profile/update \
  -H "Content-Type: application/json" \
  -d '{"userId":"test_id","profileData":{"name":"Test User"}}'

# Test avatar upload (using Postman or similar)
POST http://localhost:3000/api/profile/upload-avatar
Form Data: userId=test_id, avatar=@image.jpg
```

## 🚀 Setup Instructions

### 1. Environment Configuration
```bash
# Copy environment template
cp env.example .env.local

# Fill in your values
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
MONGO_URL=your-mongodb-connection
```

### 2. Database Setup
```bash
# Ensure MongoDB is running
mongod

# Or use MongoDB Atlas
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/quickcourt
```

### 3. File Permissions
```bash
# Ensure upload directory is writable
mkdir -p public/uploads/avatars
chmod 755 public/uploads/avatars
```

### 4. Start Development Server
```bash
npm install
npm run dev
```

## 🔒 Security Considerations

### File Upload Security
- File type validation
- Size limit enforcement
- Secure file naming
- Organized storage structure

### Data Validation
- Input sanitization
- Type checking
- Required field validation
- Database constraints

### Access Control
- User authentication required
- Profile ownership verification
- Role-based permissions

## 📱 Responsive Design

### Mobile Optimization
- Touch-friendly interfaces
- Optimized form layouts
- Responsive image handling
- Mobile-first CSS approach

### Breakpoint Support
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🎯 Future Enhancements

### Planned Features
- **Social Media Integration** - Link social profiles
- **Profile Verification** - ID verification system
- **Advanced Privacy** - Granular privacy controls
- **Profile Analytics** - View tracking and insights
- **Bulk Import** - CSV profile import
- **API Rate Limiting** - Request throttling

### Technical Improvements
- **Image Optimization** - Automatic resizing and compression
- **CDN Integration** - Global image delivery
- **Caching Strategy** - Profile data caching
- **Background Jobs** - Async profile processing

## 🐛 Troubleshooting

### Common Issues

#### 1. File Upload Fails
- Check file size (max 5MB)
- Verify file type (JPEG, PNG, WebP)
- Ensure upload directory permissions
- Check MongoDB connection

#### 2. Profile Not Saving
- Verify user authentication
- Check API endpoint availability
- Validate required fields
- Review database constraints

#### 3. Images Not Displaying
- Check file path in database
- Verify file exists in uploads directory
- Check public folder permissions
- Clear browser cache

### Debug Mode
```javascript
// Enable detailed logging
console.log('Profile Data:', profileData)
console.log('User Context:', user)
console.log('API Response:', response)
```

## 📚 Additional Resources

- [Next.js File Upload](https://nextjs.org/docs/api-routes/api-routes)
- [MongoDB Schema Design](https://docs.mongodb.com/manual/data-modeling/)
- [React State Management](https://reactjs.org/docs/hooks-state.html)
- [Tailwind CSS Components](https://tailwindcss.com/components)

## 🆘 Support

For technical support:
1. Check the troubleshooting section
2. Review console logs and network requests
3. Verify environment configuration
4. Test with minimal data
5. Check database connectivity

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintainer**: QuickCourt Development Team
