from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Notification

User = get_user_model()

# ✅ [수정] FeedUserSerializer 정의 (알림 보낸 사람 정보용)
class FeedUserSerializer(serializers.ModelSerializer):
    # 실제 닉네임과 프사는 hobbies_profile에 들어있습니다.
    profile_image = serializers.ImageField(source='hobbies_profile.image', read_only=True)
    nickname = serializers.CharField(source='hobbies_profile.nickname', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'profile_image', 'nickname']

# ✅ [수정] 이제 위에서 정의한 FeedUserSerializer를 사용할 수 있습니다.
class NotificationSerializer(serializers.ModelSerializer):
    sender = FeedUserSerializer(read_only=True) 
    
    class Meta:
        model = Notification
        fields = ['id', 'sender', 'notification_type', 'related_id', 'is_read', 'created_at']

# (혹시 다른 곳에서 SimpleUserSerializer를 쓴다면 아래처럼 남겨두거나 FeedUserSerializer로 대체해도 됩니다)
class SimpleUserSerializer(serializers.ModelSerializer):
    profile_image = serializers.ImageField(source='profile.profile_image', read_only=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'profile_image']