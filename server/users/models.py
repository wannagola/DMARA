from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser

class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    # upload_to: 이미지가 저장될 폴더 이름 (media/profile_pics/ 에 저장됨)
    # blank=True: 프사 없이 가입해도 됨
    profile_image = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    nickname = models.CharField(max_length=30, default='Anonymous', blank=True)
    introduction = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # 1. 내가 팔로우하는 사람들 (Following)
    # symmetrical=False: 내가 팔로우한다고 상대방도 나를 자동으로 팔로우하는 건 아님 (인스타 방식)
    followings = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        related_name='followers', 
        symmetrical=False, 
        blank=True
    )
    
    # 2. 나의 친한 친구들 (Close Friends)
    # 내가 지정한 사람만 내 '친한 친구 공개' 글을 볼 수 있음
    close_friends = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        related_name='close_friended_by', 
        symmetrical=False, 
        blank=True
    )

    def __str__(self):
        return f"{self.user.username}'s Profile"

class Notification(models.Model):
    TYPE_CHOICES = (
        ('follow', 'Follow'),
        ('like', 'Like'),
    )
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_notifications')
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    related_id = models.IntegerField(null=True, blank=True) # 좋아요 눌린 글 ID 등
    is_read = models.BooleanField(default=False) # 읽음 여부
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']