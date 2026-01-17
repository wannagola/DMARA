from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet

router = DefaultRouter()
router.register(r'records', PostViewSet) # 주소: /records/

urlpatterns = [
    path('', include(router.urls)),
]