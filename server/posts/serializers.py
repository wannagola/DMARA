from rest_framework import serializers
from .models import Post
from django.contrib.auth import get_user_model

User = get_user_model()

# 게시글 작성자 정보를 간단히 보여주기 위한 시리얼라이저
class FeedUserSerializer(serializers.ModelSerializer):
    # hobbies 앱의 프로필 이미지를 가져오기 위해 source 사용
    profile_image = serializers.ImageField(source='hobbies_profile.image', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile_image']

class PostSerializer(serializers.ModelSerializer):
    user = FeedUserSerializer(read_only=True)
    likes_count = serializers.IntegerField(source='likes.count', read_only=True)
    is_liked = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()
    date_str = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'user', 'category', 'title', 'date', 'date_str',
            'content', 'poster_url', 'user_image', 'visibility',
            'likes_count', 'is_liked', 'is_owner', 'created_at'
        ]
        read_only_fields = ['user', 'created_at', 'likes_count']

    def get_is_owner(self, obj):
        request = self.context.get('request')
        return obj.user == request.user if (request and request.user) else False

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False

    def get_date_str(self, obj):
        return obj.date.strftime('%Y.%m.%d')