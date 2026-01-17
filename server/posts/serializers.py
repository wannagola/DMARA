from rest_framework import serializers
from .models import Post
from hobbies.serializers import PostSerializer

class PostSerializer(serializers.ModelSerializer):
    # 팁: 그냥 related_hobby라고만 쓰면 DB ID(숫자 1, 2)만 나갑니다.
    # 아래처럼 읽기 전용 필드를 추가하면, React가 "뉴진스" 같은 제목까지 한 번에 볼 수 있어 편합니다.
    hobby_detail = PostSerializer(source='related_hobby', read_only=True)

    class Meta:
        model = Post
        fields = '__all__'