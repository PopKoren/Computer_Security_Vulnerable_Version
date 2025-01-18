### This is the vulnerable Version of the project, for the safe version please click here:
### https://github.com/PopKoren/Computer_Security_Safe_Version
___

# Communication LTD Project

A full-stack web application for internet service provider management with subscription plans and user authentication.

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- Python (3.8+)

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
```

### Create a superuser (admin):
```
python manage.py createsuperuser
```
Follow the prompts to set the username, email, and password.

### Start the development server:
```
python manage.py runserver
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


