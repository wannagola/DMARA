from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HobbyItemViewSet, ProfileViewSet, ExternalSearchView, GoogleLogin, UserItemsView

router = DefaultRouter()
router.register(r'profile', ProfileViewSet, basename='profile')
router.register(r'items', HobbyItemViewSet, basename='hobby-item')
# posts 제거됨

urlpatterns = [
    path('', include(router.urls)),
    path('search/', ExternalSearchView.as_view(), name='search'),
    path('user/<int:user_id>/items/', UserItemsView.as_view(), name='user-items'),
    path('google/', GoogleLogin.as_view(), name='google_login'),  
]