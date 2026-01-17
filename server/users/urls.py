from django.urls import path
from .views import CloseFriendCandidatesView, ManageFollowerView
urlpatterns = [
    # 이 주소로 요청하면 후보 리스트를 줍니다
    path('candidates/', CloseFriendCandidatesView.as_view()),

    # ▼ 팔로워 관리 주소 추가
    path('followers/', ManageFollowerView.as_view()),
]