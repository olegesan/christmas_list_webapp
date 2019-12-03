from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name = 'index'),
    path('signup/start_family', views.signup, name = 'signup'),
    path('signup/join_family', views.signup, name = 'signup'),
    path('login', views.login_page, name = 'login'),
    path('logout', views.logout_func, name = 'logout'),
    path('add_gifts', views.add_gifts, name = 'add_gifts'),
    path('random_gifts', views.random_gifts, name = 'random_gifts'),
    path('reveal_names', views.reveal_names, name='reveal_names'),
    path('some_button', views.some_button, name='some_button'),
    path('<str:user>', views.profile, name = 'profile'),
    
]