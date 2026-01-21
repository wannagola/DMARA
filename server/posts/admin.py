from django.contrib import admin
from .models import Post

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'user', 'visibility', 'date')
    list_filter = ('category', 'visibility', 'date')
    search_fields = ('title', 'content')