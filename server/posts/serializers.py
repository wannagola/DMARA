from rest_framework import serializers
from .models import Post
from django.contrib.auth import get_user_model

User = get_user_model()

# 게시글 작성자 정보를 간단히 보여주기 위한 시리얼라이저
class FeedUserSerializer(serializers.ModelSerializer):
    profile_image = serializers.ImageField(source='hobbies_profile.image', read_only=True)
    # ✅ 닉네임도 user 객체 내부에서 사용할 수 있게 추가
    nickname = serializers.ReadOnlyField(source='hobbies_profile.nickname') 
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile_image', 'nickname']

class PostSerializer(serializers.ModelSerializer):
    user = FeedUserSerializer(read_only=True)
    likes_count = serializers.IntegerField(source='likes.count', read_only=True)
    is_liked = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()
    date_str = serializers.SerializerMethodField()

    # ✅ [핵심] 최상위 레벨에 nickname 필드 추가 (프론트엔드가 바로 읽을 수 있게)
    nickname = serializers.ReadOnlyField(source='user.hobbies_profile.nickname')

    class Meta:
        model = Post
        fields = [
            'id', 'user', 'category', 'title', 'date', 'date_str',
            'content', 'poster_url', 'user_image', 'visibility',
            'likes_count', 'is_liked', 'is_owner', 'created_at',
            'nickname' # ✅ 여기에 꼭 추가해야 합니다!
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