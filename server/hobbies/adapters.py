from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.contrib.auth import get_user_model

User = get_user_model()

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def pre_social_login(self, request, sociallogin):
        # 1. 이미 로그인된 상태면 패스
        if request.user.is_authenticated:
            return

        # 2. 이미 소셜 로그인으로 가입된 계정이면 패스 (로그인 진행)
        if sociallogin.is_existing:
            return

        # 3. ★ 핵심 로직: 이메일이 같은 유저가 있는지 찾기
        if sociallogin.user.email:
            try:
                # 이메일로 기존 유저 찾기
                user = User.objects.get(email=sociallogin.user.email)
                
                # 찾았다면? -> 소셜 계정을 그 유저에게 강제로 연결!
                sociallogin.connect(request, user)
                
            except User.DoesNotExist:
                # 없으면 그냥 회원가입 진행
                pass