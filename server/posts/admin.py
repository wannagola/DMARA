from django.contrib import admin
from .models import Post

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    # ID, 작성자, 날짜, 공개범위 순으로 보여줌
    list_display = ('id', 'user', 'date', 'visibility', 'related_hobby')
    
    # 날짜별, 공개범위별 필터링
    list_filter = ('date', 'visibility')