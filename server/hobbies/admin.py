from django.contrib import admin
from .models import Post

@admin.register(Post)
class HobbyItemAdmin(admin.ModelAdmin):
    # 관리자 목록 화면에 보여줄 칼럼들
    list_display = ('title', 'category', 'user', 'created_at')
    
    # 우측에 필터 메뉴 생성 (카테고리별 보기 가능)
    list_filter = ('category',)
    
    # 검색창 생성 (제목으로 검색 가능)
    search_fields = ('title',)