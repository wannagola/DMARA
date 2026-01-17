from rest_framework import serializers
from .models import HobbyItem, Post, Profile
from django.contrib.auth import get_user_model

User = get_user_model()

# 1. 프로필
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['nickname', 'bio', 'image']

# 2. 유저 정보 (게시글 작성자용)
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

# 4. 게시글 (경기 정보 포함됨)
class PostSerializer(serializers.ModelSerializer):
    user = UserInfoSerializer(read_only=True)
    like_count = serializers.IntegerField(source='likes.count', read_only=True)
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = '__all__' # home_team, away_score 등 다 포함됨!
        read_only_fields = ['user', 'created_at']

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False