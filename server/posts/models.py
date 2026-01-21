from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

# 카테고리 (Hobbies와 동일하게 맞춰둠)
CATEGORY_CHOICES = [
    ('MUSIC', 'Music'),
    ('IDOL', 'Idol'),
    ('MOVIE', 'Movie'),
    ('DRAMA', 'Drama'),
    ('SPORTS', 'Sports (Team)'),
    ('MATCH', 'Match Schedule'),
    ('ACTOR', 'Actor'),
    ('SHOW', 'Exhibitions & Shows'),
    ('FOOD', 'Food'),
    ('ETC', 'Etc'),
]

# 공개 범위
VISIBILITY_CHOICES = [
    ('PUBLIC', '전체 공개'),
    ('FRIENDS', '친한 친구만'),
    ('PRIVATE', '나만 보기'),
]

class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='ETC')
    
    title = models.CharField(max_length=200)       # 제목
    date = models.DateField()                      # 날짜
    content = models.TextField(blank=True)         # 내용
    
    # 이미지 2개
    poster_url = models.URLField(max_length=500, blank=True, null=True)
    user_image = models.ImageField(upload_to='posts/%Y/%m/%d/', blank=True, null=True)
    
    # 공개 범위
    visibility = models.CharField(max_length=10, choices=VISIBILITY_CHOICES, default='PUBLIC')
    
    # 좋아요
    likes = models.ManyToManyField(User, related_name='liked_posts', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.title} ({self.get_visibility_display()})"