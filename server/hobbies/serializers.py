from rest_framework import serializers
from .models import HobbyItem, Profile
from django.contrib.auth import get_user_model

User = get_user_model()

# 1. 프로필
class ProfileSerializer(serializers.ModelSerializer):
    # ✅ [필수 추가] 닉네임 없을 때 아이디라도 보여주기 위해
    username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Profile
        # ✅ 'username'을 필드 목록에 꼭 추가하세요!
        fields = ['nickname', 'bio', 'image', 'username']

# 2. 유저 정보
class UserInfoSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(source='hobbies_profile', read_only=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile']

# 3. 관심사 아이템
class HobbyItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = HobbyItem
        fields = '__all__'
        read_only_fields = ['user']