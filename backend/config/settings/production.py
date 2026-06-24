"""
Production settings.
"""

from .base import *

DEBUG = False

ALLOWED_HOSTS = [
    'your-production-domain.com',
    'www.your-production-domain.com',
]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('POSTGRES_DB'),
        'USER': os.environ.get('POSTGRES_USER'),
        'PASSWORD': os.environ.get('POSTGRES_PASSWORD'),
        'HOST': os.environ.get('POSTGRES_HOST', 'db'),
        'PORT': os.environ.get('POSTGRES_PORT', '5432'),
    }
}

# Use environment variables for secrets
SECRET_KEY = os.environ.get('SECRET_KEY')
