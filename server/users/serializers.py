from rest_framework import serializers
from django.contrib.auth.models import User

class SimpleUserSerializer(serializers.ModelSerializer):
    # User 모델에는 이미지가 없지만, profile을 통해 건너건너 가져옵니다.
    # read_only=True: 이 시리얼라이저는 '보여주기용'이라서 수정은 안 한다는 뜻
    profile_image = serializers.ImageField(source='profile.profile_image', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'profile_image']