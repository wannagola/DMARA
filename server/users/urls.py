from django.urls import path
from .views import CloseFriendCandidatesView, ManageFollowerView, FollowToggleView, FollowingListView, UserProfileView, UserSearchView, ImageProxyView, NotificationView

urlpatterns = [
    # ✅ [핵심] 이 줄이 있어야 '/api/users/3/profile/' 요청이 작동합니다.
    path('<int:user_id>/profile/', UserProfileView.as_view(), name='user-profile'),

    # 팔로우 관련 기능
    path('<int:user_id>/follow/', FollowToggleView.as_view(), name='follow-toggle'),
    path('following/', FollowingListView.as_view(), name='following-list'),
    path('followers/', ManageFollowerView.as_view(), name='follower-list'),
    
    # 검색 및 친구 추천
    path('search/', UserSearchView.as_view(), name='user-search'),
    path('close-friends/', CloseFriendCandidatesView.as_view(), name='close-friends'),

    path('proxy/image/', ImageProxyView.as_view(), name='image-proxy'),
    path('notifications/', NotificationView.as_view(), name='notifications'),
]