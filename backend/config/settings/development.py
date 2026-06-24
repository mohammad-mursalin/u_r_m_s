"""
Development settings for local development.
"""

from .base import *

DEBUG = True

# Override database URL for local development
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'routine_db',
        'USER': 'routine_user',
        'PASSWORD': 'routine_pass',
        'HOST': 'db',
        'PORT': '5432',
    }
}

# Media files
MEDIA_ROOT = BASE_DIR / 'media'
MEDIA_URL = '/media/'
