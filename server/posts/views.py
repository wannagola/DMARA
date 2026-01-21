from django.db.models import Q
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Post
from .serializers import PostSerializer

class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            # 1. 내 글은 무조건 다 보임 (PRIVATE 포함)
            # 2. 남의 글은 'PUBLIC'이거나 'FRIENDS'인 것만 보임 (PRIVATE 제외)
            return Post.objects.filter(
                Q(user=user) | 
                (~Q(user=user) & Q(visibility__in=['PUBLIC', 'FRIENDS']))
            ).order_by('-date', '-created_at')
        else:
            # 비로그인 유저는 전체 공개만 볼 수 있음
            return Post.objects.filter(visibility='PUBLIC').order_by('-date', '-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, pk=None):
        post = self.get_object()
        user = request.user
        if post.likes.filter(id=user.id).exists():
            post.likes.remove(user)
            liked = False
        else:
            post.likes.add(user)
            liked = True
        return Response({'liked': liked, 'likes_count': post.likes.count()})