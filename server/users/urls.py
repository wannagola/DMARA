from django.urls import path
from .views import CloseFriendCandidatesView, ManageFollowerView, FollowToggleView, FollowingListView, UserProfileView

urlpatterns = [
    # 이 주소로 요청하면 후보 리스트를 줍니다
    path('candidates/', CloseFriendCandidatesView.as_view()),

    # ▼ 팔로워 관리 주소 추가
    path('followers/', ManageFollowerView.as_view()),

    # Following list
    path('following/', FollowingListView.as_view()),
    
    # Follow/Unfollow toggle
    path('<int:user_id>/follow/', FollowToggleView.as_view()),
    path('<int:user_id>/profile/', UserProfileView.as_view()),
]