# hobbies/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HobbyItemViewSet, PostViewSet, ProfileViewSet, ExternalSearchView, GoogleLogin, UserItemsView

router = DefaultRouter()
router.register(r'profile', ProfileViewSet, basename='profile')
router.register(r'items', HobbyItemViewSet, basename='hobby-item')
router.register(r'posts', PostViewSet, basename='post')

urlpatterns = [
    path('', include(router.urls)),
    path('search/', ExternalSearchView.as_view(), name='search'),
    path('user/<int:user_id>/items/', UserItemsView.as_view(), name='user-items'),
    
    # ★ 구글 로그인 URL도 여기에 있어야 합니다!
    path('google/', GoogleLogin.as_view(), name='google_login'),  
]