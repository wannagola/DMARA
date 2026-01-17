from django.contrib import admin
from .models import Profile

class ProfileAdmin(admin.ModelAdmin):
    # 1. 목록 화면에서 누구의 프로필인지 바로 보이게 함
    list_display = ('user', 'id') 
    
    # 2. 관리자 페이지에서 유저 이름으로 검색 가능하게 함
    search_fields = ('user__username',) 
    
    # 3. 친구 선택할 때 [왼쪽 박스 -> 오른쪽 박스]로 옮기는 UI 사용 (이거 안 하면 불편해요!)
    filter_horizontal = ('followings', 'close_friends')

admin.site.register(Profile, ProfileAdmin)