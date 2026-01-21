from rest_framework.generics import RetrieveAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Q
from hobbies.serializers import ProfileSerializer
from hobbies.models import Profile
import requests
from django.http import HttpResponse
from rest_framework.permissions import AllowAny
from .models import Profile, Notification # Notification 추가
from .serializers import NotificationSerializer # 추가

User = get_user_model()

# 헬퍼 함수
def get_user_info(target_user, request=None):
    display_name = target_user.username
    img_url = None
    is_following = False # 기본값

    # 1. 프로필 정보 추출
    if hasattr(target_user, 'hobbies_profile'):
        if target_user.hobbies_profile.nickname:
            display_name = target_user.hobbies_profile.nickname
        
        if target_user.hobbies_profile.image:
            if request:
                img_url = request.build_absolute_uri(target_user.hobbies_profile.image.url)
            else:
                img_url = target_user.hobbies_profile.image.url
    
    # 2. 내가 이 사람을 팔로우 중인지 확인
    if request and request.user.is_authenticated:
        # 내 팔로잉 목록에 target_user가 있는지 확인
        is_following = request.user.profile.followings.filter(id=target_user.id).exists()
            
    return {
        "id": target_user.id,
        "username": target_user.username,
        "display_name": display_name,
        "profile_image": img_url,
        "is_following": is_following, # ✅ 프론트엔드 버튼 상태 결정용
    }

# ✅ 1. 특정 유저 프로필 가져오기 (APIView로 변경하여 안정성 확보)
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        if user_id == 'me': 
             user = request.user
        else:
             user = get_object_or_404(User, id=user_id)

        # 1. Hobbies 프로필(실제 데이터) 가져오기
        nickname = user.username
        bio = ""
        img_url = None
        
        if hasattr(user, 'hobbies_profile'):
            hp = user.hobbies_profile
            nickname = hp.nickname or user.username
            # 자기소개 필드명 호환성 처리 (bio or introduction)
            bio = getattr(hp, 'bio', '') or getattr(hp, 'introduction', '')
            if hp.image:
                img_url = request.build_absolute_uri(hp.image.url)
        
        # 2. 팔로잉 상태 확인 (Users 프로필)
        is_following = False
        if request.user.is_authenticated and hasattr(request.user, 'profile'):
             is_following = request.user.profile.followings.filter(id=user.id).exists()

        response_data = {
            "username": user.username,
            "nickname": nickname,
            "bio": bio,
            "image": img_url,
            "profile_image": img_url,
            "is_following": is_following,
        }
        return Response(response_data)

# ✅ [추가] 내 알림 목록 가져오기 & 읽음 처리
class NotificationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # 내 알림 최신순 조회
        notifications = Notification.objects.filter(recipient=request.user)
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)

    def post(self, request):
        # 알림 읽음 처리 (전체 읽음 혹은 특정 ID)
        notif_id = request.data.get('id')
        if notif_id:
            Notification.objects.filter(id=notif_id, recipient=request.user).update(is_read=True)
        else:
            Notification.objects.filter(recipient=request.user).update(is_read=True)
        return Response({"message": "Marked as read"})

# ✅ [수정] 팔로우 토글 뷰: 팔로우 성공 시 알림 생성 코드 추가
class FollowToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        me = request.user
        target_user = get_object_or_404(User, id=user_id)

        if me == target_user:
            return Response({"message": "Self follow error"}, status=400)

        if target_user in me.profile.followings.all():
            me.profile.followings.remove(target_user)
            return Response({"message": "Unfollowed"})
        else:
            me.profile.followings.add(target_user)
            
            # 🚀 [추가] 알림 생성 로직 (이미 알림이 없을 때만 생성 추천)
            Notification.objects.create(
                recipient=target_user,
                sender=me,
                notification_type='follow'
            )
            
            return Response({"message": "Followed"})

# 3. 내가 팔로우하는 목록
class FollowingListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        me = request.user
        following_users = me.profile.followings.all()
        data = [get_user_info(u, request) for u in following_users]
        return Response(data)

# 4. 친한 친구 후보 (팔로워+팔로잉)
class CloseFriendCandidatesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        me = request.user
        group_a = me.profile.followings.all()
        group_b = User.objects.filter(profile__followings=me)
        candidates = (group_a | group_b).distinct()
        data = [get_user_info(u, request) for u in candidates]
        return Response(data)

# 5. 나를 팔로우하는 목록 & 삭제
class ManageFollowerView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        me = request.user
        followers = User.objects.filter(profile__followings=me)
        data = [get_user_info(u, request) for u in followers]
        return Response(data)

    def post(self, request):
        me = request.user
        target_id = request.data.get('user_id')
        target_user = get_object_or_404(User, id=target_id)
        
        if me in target_user.profile.followings.all():
            target_user.profile.followings.remove(me)
            return Response({"message": "Removed follower."})
        else:
            return Response({"message": "Not a follower."}, status=400)

# 6. 유저 검색
class UserSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.GET.get('username', '')
        if not query:
            return Response([])
        
        users = User.objects.filter(
            Q(username__icontains=query) | 
            Q(hobbies_profile__nickname__icontains=query)
        ).distinct()
        
        data = [get_user_info(u, request) for u in users]
        return Response(data)

class ImageProxyView(APIView):
    permission_classes = [AllowAny] # 로그인 안 해도 이미지 볼 수 있게

    def get(self, request):
        url = request.GET.get('url')
        if not url:
            return HttpResponse(status=400)
        
        try:
            # 1. 서버가 대신 이미지 다운로드
            response = requests.get(url, stream=True, timeout=5)
            
            # 2. 브라우저에게 그대로 전달 (Content-Type 유지)
            django_response = HttpResponse(
                response.content, 
                content_type=response.headers.get('Content-Type', 'image/jpeg')
            )
            
            # 3. 🚀 핵심: CORS 모든 도메인 허용 헤더 부착
            django_response['Access-Control-Allow-Origin'] = '*'
            return django_response
            
        except Exception as e:
            print(f"Proxy Error: {e}")
            return HttpResponse(status=500)