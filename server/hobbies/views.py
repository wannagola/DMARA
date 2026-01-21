from rest_framework import viewsets, permissions, status
from rest_framework.generics import ListAPIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from datetime import datetime, timedelta
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

# 모델 및 시리얼라이저
from .models import HobbyItem, Profile
from .serializers import HobbyItemSerializer, ProfileSerializer

# 검색 Utils
from .utils import search_tmdb, search_spotify, search_sports, search_manual
from .utils_culture import search_performances
from .utils_match import (
    get_football_matches, get_baseball_matches, get_basketball_matches, 
    get_f1_matches, get_volleyball_matches
)

# 구글 로그인
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView

# 1. 프로필 관리
class ProfileViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProfileSerializer
    
    # ▼ [수정] JSONParser를 추가해서 텍스트(JSON)와 파일(MultiPart) 둘 다 받게 설정
    parser_classes = [MultiPartParser, FormParser, JSONParser] 

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

class UserItemsView(ListAPIView):
    serializer_class = HobbyItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        return HobbyItem.objects.filter(user_id=user_id)

# 2. 관심사 아이템 (Who am I)
class HobbyItemViewSet(viewsets.ModelViewSet):
    serializer_class = HobbyItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # 모델의 Meta ordering 설정 덕분에 자동으로 order 순으로 정렬되어 나옴
        return HobbyItem.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # 새로 만들 때, 맨 마지막 순서(가장 큰 order + 1)로 설정
        last_item = HobbyItem.objects.filter(user=self.request.user).order_by('-order').first()
        new_order = (last_item.order + 1) if last_item else 0
        serializer.save(user=self.request.user, order=new_order)

    # ✅ [추가] 순서 변경 API
    # 요청 예시: POST /api/hobbies/items/reorder/ 
    # body: { "ordered_ids": [5, 2, 8, 1] }  <-- ID가 5인게 0번, 2인게 1번...
    @action(detail=False, methods=['post'])
    def reorder(self, request):
        ordered_ids = request.data.get('ordered_ids', [])
        
        # 유저가 보낸 ID 리스트를 순서대로 돌면서 업데이트
        for index, item_id in enumerate(ordered_ids):
            # 내 아이템인지 확인하고 order 업데이트
            HobbyItem.objects.filter(id=item_id, user=request.user).update(order=index)
            
        return Response({"status": "success", "message": "Order updated"})

# 3. 검색 API
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
                query_lower = query.lower()
                all_games = [g for g in all_games if query_lower in g['home'].lower() or query_lower in g['away'].lower()]

            result = sorted(all_games, key=lambda x: x['time'])
        elif category in ['FOOD', 'ETC']:
            result = search_manual(query, category)
            
        return Response({"results": result})

# 구글 로그인
class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    callback_url = "http://127.0.0.1:8000/api/hobbies/google/callback/" 
    client_class = OAuth2Client