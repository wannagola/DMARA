from django.db import models
from django.conf import settings
from hobbies.models import Post  # 방금 만든 hobbies 모델을 가져옵니다

class Post(models.Model):
    VISIBILITY_CHOICES = [
        ('PUBLIC', '전체 공개'),
        ('FRIENDS', '친한 친구만'),
        ('PRIVATE', '나만 보기'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    # 1. 날짜 (캘린더 기능 필수)
    date = models.DateField() 
    
    # 2. 취향 태그 (선택 사항)
    # 탭1에 등록된 취향을 가져와서 연결합니다. (예: 'NewJeans' 태그 걸고 일기 쓰기)
    related_hobby = models.ForeignKey(Post, on_delete=models.SET_NULL, null=True, blank=True)
    
    content = models.TextField() # 일기 내용
    
    # 3. 직접 업로드하는 사진
    image = models.ImageField(upload_to='posts/%Y/%m/%d/', blank=True, null=True)
    
    # 4. 공개 범위
    visibility = models.CharField(max_length=10, choices=VISIBILITY_CHOICES, default='PUBLIC')

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.date} - {self.user.username}의 기록"