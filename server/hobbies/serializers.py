from rest_framework import serializers
from .models import HobbyItem, Profile
from django.contrib.auth import get_user_model

User = get_user_model()

# 1. 프로필
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['nickname', 'bio', 'image']

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