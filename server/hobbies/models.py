from django.db import models
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver

User = get_user_model()

# 카테고리
CATEGORY_CHOICES = [
    ('MUSIC', 'Music'),
    ('IDOL', 'Idol'),
    ('MOVIE', 'Movie'),
    ('DRAMA', 'Drama'),
    ('SPORTS', 'Sports (Team)'),
    ('MATCH', 'Match Schedule'),
    ('ACTOR', 'Actor'),
    ('EXHIBITION', 'Exhibitions & Shows'),
    ('FOOD', 'Food'),
    ('ETC', 'Etc'),
]

# 1. 사용자 프로필 (Who am I 상단)
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='hobbies_profile')
    nickname = models.CharField(max_length=50, blank=True)
    bio = models.CharField(max_length=100, blank=True, default="자신을 한 줄로 소개해 주세요.")
    image = models.ImageField(upload_to='profile_pics/', blank=True, null=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

# 유저 가입 시 프로필 자동 생성
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

# 2. 관심사 아이템 (Who am I 하단 박제용)
class HobbyItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='hobbies')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    title = models.CharField(max_length=200)
    subtitle = models.CharField(max_length=200, blank=True)
    image_url = models.URLField(blank=True, null=True) 
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} likes {self.title}"