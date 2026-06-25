"""
Django Tests for University Routine Management System
Tests all API endpoints and backend functionality
"""

from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from apps.routine.models import Semester, Teacher, Course, Room, Batch, TimeSlot


class TestBackendAPI(TestCase):
    """Test backend API endpoints"""

    def setUp(self):
        self.client = Client()
        self.user = get_user_model().objects.create_superuser(username='admin', password='admin123')
        self.client.login(username='admin', password='admin123')
        self.teacher = Teacher.objects.create(full_name='Test', short_code='TT')
        self.course = Course.objects.create(code='CS101', name='CS 101')
        self.room = Room.objects.create(room_number='RT-101')
        self.batch = Batch.objects.create(name='Test Batch')
        self.time_slot = TimeSlot.objects.create(slot_number=1, start_time='09:00', end_time='10:00')
        self.semester = Semester.objects.create(name='Spring 2026', is_active=True, is_published=True)

    def test_get_active_semester(self):
        response = self.client.get('/api/v1/routine/active/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('semester', response.json())

    def test_create_teacher(self):
        response = self.client.post('/api/v1/teachers/', {'full_name': 'New', 'short_code': 'NT'}, content_type='application/json')
        self.assertEqual(response.status_code, 201)

    def test_create_course(self):
        response = self.client.post('/api/v1/courses/', {'code': 'CS102', 'name': 'CS 102'}, content_type='application/json')
        self.assertEqual(response.status_code, 201)

    def test_create_room(self):
        response = self.client.post('/api/v1/rooms/', {'room_number': 'RT-102'}, content_type='application/json')
        self.assertEqual(response.status_code, 201)

    def test_create_batch(self):
        response = self.client.post('/api/v1/batches/', {'name': 'New Batch'}, content_type='application/json')
        self.assertEqual(response.status_code, 201)

    def test_create_semester(self):
        response = self.client.post('/api/v1/semesters/', {'name': 'Fall 2026'}, content_type='application/json')
        self.assertEqual(response.status_code, 201)

    def test_activate_semester(self):
        s = Semester.objects.create(name='Test', is_active=False, is_published=False)
        response = self.client.post(f'/api/v1/semesters/{s.id}/activate/')
        self.assertEqual(response.status_code, 200)
        s.refresh_from_db()
        self.assertTrue(s.is_active)

    def test_publish_semester(self):
        s = Semester.objects.create(name='Test', is_active=True, is_published=False)
        response = self.client.post(f'/api/v1/semesters/{s.id}/publish/')
        self.assertEqual(response.status_code, 200)
        s.refresh_from_db()
        self.assertTrue(s.is_published)

    def test_get_teachers(self):
        response = self.client.get('/api/v1/teachers/')
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)

    def test_get_semesters(self):
        response = self.client.get('/api/v1/semesters/')
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)
