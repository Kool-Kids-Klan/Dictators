from django.urls import path
from dictators.dictators_game import views

urlpatterns = [
    path("", views.MainPage.as_view()),
    path("api/user/create", views.CreateUser.as_view()),
    path("api/user/authenticate", views.AuthenticateUser.as_view())
]
