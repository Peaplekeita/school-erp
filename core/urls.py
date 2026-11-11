from django.urls import path

from . import views

urlpatterns = [
    path("health", views.health),
    path("students", views.students),
    path("classes", views.classes),
    path("enrollments", views.enrollments),
    path("classes/<int:class_id>/students", views.class_students),
]
