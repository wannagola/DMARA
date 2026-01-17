from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from datetime import datetime, timedelta

# 모델 및 시리얼라이저
from .models import HobbyItem, Post, Profile
from .serializers import HobbyItemSerializer, PostSerializer, ProfileSerializer

# 검색 Utils
from .utils import search_tmdb, search_spotify, search_sports, search_manual
from .utils_culture import search_performances
from .utils_match import (
    get_football_matches, 
    get_baseball_matches, 
    get_basketball_matches, 
    get_f1_matches, 
    get_volleyball_matches
)

# ★ [복구] 구글 로그인 관련 Import
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView

# 1. 프로필 관리
class ProfileViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProfileSerializer

    @action(detail=False, methods=['GET', 'PATCH', 'PUT'])
    def me(self, request):
        try:
            profile = request.user.hobbies_profile
        except:
            profile = Profile.objects.create(user=request.user)

        if request.method == 'GET':
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        elif request.method in ['PATCH', 'PUT']:
            serializer = self.get_serializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# 2. 관심사 아이템 (Who am I)
class HobbyItemViewSet(viewsets.ModelViewSet):
    serializer_class = HobbyItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return HobbyItem.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# 3. 게시글 (Comment & 경기 기록)
class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        mode = self.request.query_params.get('mode', 'all')
        if mode == 'my':
            return Post.objects.filter(user=self.request.user).order_by('-date')
        return Post.objects.all().order_by('-date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        if instance.user != self.request.user:
            raise PermissionDenied("본인의 글만 삭제할 수 있습니다.")
        instance.delete()

    @action(detail=True, methods=['POST'], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, pk=None):
        post = self.get_object()
        user = request.user
        if post.likes.filter(id=user.id).exists():
            post.likes.remove(user)
            return Response({'status': 'unliked', 'like_count': post.likes.count()})
        else:
            post.likes.add(user)
            return Response({'status': 'liked', 'like_count': post.likes.count()})

# 4. 검색 API (MATCH 포함)
class ExternalSearchView(APIView):
    def get(self, request):
        query = request.GET.get('query')
        category = request.GET.get('category')
        date = request.GET.get('date')
        
        if not category:
            return Response({"error": "Category required"}, status=400)

        result = []
        
        if category in ['MUSIC', 'IDOL']:
            result = search_spotify(query, category)

        elif category in ['MOVIE', 'DRAMA', 'OTT', 'ACTOR']:
            result = search_tmdb(query, category)

        elif category == 'SPORTS':
            result = search_sports(query)

        elif category == 'EXHIBITION' or category == 'CULTURE':
            past_date = (datetime.today() - timedelta(days=3650)).strftime('%Y%m%d')
            future_date = (datetime.today() + timedelta(days=365)).strftime('%Y%m%d')
            result = search_performances(past_date, future_date, query)

        elif category == 'MATCH':
            if not date:
                date = datetime.today().strftime('%Y-%m-%d')
            football = get_football_matches(date)
            baseball = get_baseball_matches(date)
            basketball = get_basketball_matches(date)
            f1 = get_f1_matches(date)
            volleyball = get_volleyball_matches(date)
            all_games = football + baseball + basketball + f1 + volleyball

            if query:
                query_lower = query.lower() # 대소문자 무시
                all_games = [
                    game for game in all_games 
                    if query_lower in game['home'].lower() or query_lower in game['away'].lower()
                ]

            result = sorted(all_games, key=lambda x: x['time'])

        elif category in ['FOOD', 'ETC']:
            result = search_manual(query, category)
            
        return Response({"results": result})

# 구글 로그인 뷰
class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    callback_url = "http://127.0.0.1:8000/api/hobbies/google/callback/" 
    client_class = OAuth2Client