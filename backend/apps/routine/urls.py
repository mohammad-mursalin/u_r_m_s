from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from apps.exports.views import export_pdf
from apps.accounts.views import login_view, logout_view, me_view, csrf_view
from apps.routine.views.master_data import (
    TeacherViewSet, CourseViewSet, RoomViewSet, BatchViewSet, TimeSlotViewSet
)
from apps.routine.views.semesters import SemesterViewSet
from apps.routine.views.routine_slots import RoutineSlotViewSet
from apps.routine.views.public import active_semester, batch_schedule, teacher_schedule

app_name = 'routine'

urlpatterns = [
    # Authentication endpoints
    path('auth/csrf/', csrf_view, name='csrf'),
    path('auth/login/', login_view, name='login'),
    path('auth/logout/', logout_view, name='logout'),
    path('auth/me/', me_view, name='me'),

    # Master data endpoints
    path('teachers/', TeacherViewSet.as_view({'get': 'list', 'post': 'create'}), name='teacher-list'),
    path('teachers/<int:pk>/', TeacherViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='teacher-detail'),
    path('courses/', CourseViewSet.as_view({'get': 'list', 'post': 'create'}), name='course-list'),
    path('courses/<int:pk>/', CourseViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='course-detail'),
    path('rooms/', RoomViewSet.as_view({'get': 'list', 'post': 'create'}), name='room-list'),
    path('rooms/<int:pk>/', RoomViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='room-detail'),
    path('batches/', BatchViewSet.as_view({'get': 'list', 'post': 'create'}), name='batch-list'),
    path('batches/<int:pk>/', BatchViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='batch-detail'),
    path('timeslots/', TimeSlotViewSet.as_view({'get': 'list', 'post': 'create'}), name='timeslot-list'),
    path('timeslots/<int:pk>/', TimeSlotViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='timeslot-detail'),

    # Semester endpoints
    path('semesters/', SemesterViewSet.as_view({'get': 'list', 'post': 'create'}), name='semester-list'),
    path('semesters/<int:pk>/', SemesterViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='semester-detail'),
    path('semesters/<int:pk>/activate/', SemesterViewSet.as_view({'post': 'activate'}), name='semester-activate'),
    path('semesters/<int:pk>/publish/', SemesterViewSet.as_view({'post': 'publish'}), name='semester-publish'),
    path('semesters/<int:pk>/unpublish/', SemesterViewSet.as_view({'post': 'unpublish'}), name='semester-unpublish'),
    path('semesters/<int:pk>/clone/', SemesterViewSet.as_view({'post': 'clone'}), name='semester-clone'),

    # Routine slot endpoints
    path('semesters/<int:sem_id>/slots/', RoutineSlotViewSet.as_view({'get': 'list', 'post': 'create'}), name='slot-list'),
    path('semesters/<int:sem_id>/slots/<int:pk>/', RoutineSlotViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='slot-detail'),
    path('semesters/<int:sem_id>/slots/check-conflicts/', RoutineSlotViewSet.as_view({'post': 'check_conflicts'}), name='slot-check-conflicts'),

    # Public routine endpoints
    path('routine/active/', active_semester, name='active-semester'),
    path('routine/batch/<str:batch_name>/', batch_schedule, name='batch-schedule'),
    path('routine/teacher/<str:teacher_code>/', teacher_schedule, name='teacher-schedule'),

    # Export endpoints
    path('export/routine/pdf/', export_pdf, name='export-pdf'),
]

# Serve static files during development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
