from django.contrib import admin
from .models import User

# User is managed by Django's built-in admin
admin.site.register(User)
