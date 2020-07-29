from django.urls import path

from . import views

app_name = "encyclopedia" #good practice to use you have more than one apps

urlpatterns = [
    path("", views.index, name="index"),
    path("wiki/<str:title>", views.title, name="title"),
    path("wiki/<str:title>/edit", views.edit, name="edit"),
    path("wiki/<str:title>/delete>", views.delete, name="delete"),
    path("search", views.search, name="search"),
    path("newpage", views.newpage, name="newpage"),
    path("randompage", views.randompage, name="randompage")
]
