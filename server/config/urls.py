"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from hobbies.views import GoogleLogin

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # 여기서 우리가 만든 앱들을 연결합니다
    path('api/hobbies/', include('hobbies.urls')),
    path('api/posts/', include('posts.urls')),
    
    # 1. 일반 로그인/회원가입 (dj-rest-auth 기본 제공)
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),

    # 2. ★ 구글 로그인 주소
    path('api/auth/google/', GoogleLogin.as_view(), name='google_login'),
    
    path('api/users/', include('users.urls')),
]

# 이미지 파일 조회를 위한 설정 (개발 모드일 때만)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
