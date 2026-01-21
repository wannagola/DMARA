from django.db.models import Q
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Post
from .serializers import PostSerializer
# ✅ [추가] Users 앱의 Notification 모델 가져오기
from users.models import Notification 

class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return Post.objects.filter(
                Q(user=user) | 
                (~Q(user=user) & Q(visibility__in=['PUBLIC', 'FRIENDS']))
            ).order_by('-date', '-created_at')
        else:
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
            
            # 🚀 [추가] 좋아요 알림 생성 로직 (내 글이 아닐 때만)
            if post.user != user:
                # get_or_create를 사용하여 중복 알림 방지 (선택 사항)
                Notification.objects.get_or_create(
                    recipient=post.user,
                    sender=user,
                    notification_type='like',
                    related_id=post.id
                )
        
        return Response({'liked': liked, 'likes_count': post.likes.count()})