from django.contrib import admin
from .models import Article, Attachment

class AttachmentInline(admin.TabularInline):
    model = Attachment
    extra = 1

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'language', 'topic', 'created_at')
    list_filter = ('language', 'topic', 'created_at')
    search_fields = ('title', 'content')
    inlines = [AttachmentInline]

@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'article', 'file')
    search_fields = ('name', 'article__title')
