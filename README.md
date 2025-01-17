=======
### This is the Vulnerable Version of the project, for the safe version please click here:
### https://github.com/PopKoren/Computer_Security_Safe_Version
>>>>>>> e8e35ebd8d9e3b1d44ab05ec17dd46ce86406689
___

# Communication LTD Project

A full-stack web application for internet service provider management with subscription plans and user authentication.

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- Python (3.8+)
- PostgreSQL or SQLite

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv env

# Activate virtual environment
# Windows:
env\Scripts\activate
# Unix/macOS:
source env/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start development server
python manage.py runserver
```

### Environment Variables
Create `.env` file in backend directory:
```env
SECRET_KEY=your_django_secret_key
DEBUG=True
DATABASE_URL=your_database_url
ALLOWED_HOSTS=localhost,127.0.0.1
EMAIL_HOST=smtp.your_email_provider.com
EMAIL_PORT=587
EMAIL_HOST_USER=your_email@example.com
EMAIL_HOST_PASSWORD=your_email_password
EMAIL_USE_TLS=True
```

### Database Configuration
In `settings.py`, configure your database:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

### Features
- User authentication (login/register)
- Password reset functionality
- Subscription management
- Admin dashboard
- User profile management

### API Endpoints
- `/api/login/` - User login
- `/api/register/` - User registration
- `/api/forgot-password/` - Password reset
- `/api/user/` - User information
- `/api/users/` - User management (admin)
- `/api/user/subscriptions/` - Subscription management

### Default Credentials
Admin:
- Username: admin
- Password: admin123

### Common Issues
1. Database migration errors:
```bash
python manage.py makemigrations
python manage.py migrate --run-syncdb
```

2. Node modules issues:
```bash
rm -rf node_modules
npm install
```

3. Port conflicts:
- Frontend runs on port 3000
- Backend runs on port 8000

### Security Notes
- Change default admin credentials
- Configure proper email settings
- Set DEBUG=False in production
- Use proper SSL/TLS in production
