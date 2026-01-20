from rest_framework.generics import RetrieveAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from hobbies.serializers import ProfileSerializer
from .models import Profile


class UserProfileView(RetrieveAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        user_id = self.kwargs.get('user_id')
        user = get_object_or_404(User, id=user_id)
        return get_object_or_404(Profile, user=user)


class FollowToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        me = request.user
        target_user = get_object_or_404(User, id=user_id)

        if me == target_user:
            return Response({"message": "You cannot follow yourself."}, status=400)

        # Check if the user is already following
        if target_user in me.profile.followings.all():
            # Unfollow
            me.profile.followings.remove(target_user)
            return Response({"message": f"You have unfollowed {target_user.username}."})
        else:
            # Follow
            me.profile.followings.add(target_user)
            return Response({"message": f"You are now following {target_user.username}."})

class FollowingListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        me = request.user
        following_users = me.profile.followings.all()
        serializer = SimpleUserSerializer(following_users, many=True)
        return Response(serializer.data)


class CloseFriendCandidatesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        me = request.user
        
        # 1. 내가 팔로우하는 사람들 (Following)
        # 내 프로필의 followings 목록에 있는 유저들
        group_a = me.profile.followings.all()
        
        # 2. 나를 팔로우하는 사람들 (Follower)
        # '어떤 프로필(profile)'의 followings 목록에 '나(me)'가 포함된 경우 -> 그 프로필의 주인(User)
        group_b = User.objects.filter(profile__followings=me)
        
        # 3. 합치기 (Union) & 중복 제거 (Distinct)
        # '|' 기호가 합집합 연산을 수행하며, distinct()가 중복을 제거합니다.
        candidates = (group_a | group_b).distinct()
        
        # 4. JSON으로 변환해서 응답
        serializer = SimpleUserSerializer(candidates, many=True)
        return Response(serializer.data)

class ManageFollowerView(APIView):
    permission_classes = [IsAuthenticated]

    # 1. 나를 팔로우하는 사람 목록 보기 (내 팬클럽 명단)
    def get(self, request):
        me = request.user
        # '어떤 프로필'의 followings에 '내(me)'가 들어있는 경우 -> 그게 바로 나의 팔로워
        followers = User.objects.filter(profile__followings=me)
        
        serializer = SimpleUserSerializer(followers, many=True)
        return Response(serializer.data)

    # 2. 팔로워 끊어내기 (강퇴)
    def post(self, request):
        me = request.user
        target_id = request.data.get('user_id') # 끊고 싶은 사람의 ID
        
        # 그 사람이 실제로 존재하는지 확인
        target_user = get_object_or_404(User, id=target_id)
        
        # 핵심 로직: 그 사람의 팔로잉 목록에서 '나'를 삭제함
        if me in target_user.profile.followings.all():
            target_user.profile.followings.remove(me)
            return Response({"message": "해당 팔로워를 삭제했습니다."})
        else:
            return Response({"message": "그 사람은 당신을 팔로우하고 있지 않습니다."}, status=400)