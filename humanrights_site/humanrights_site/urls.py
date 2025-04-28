import django.conf
import django.conf.urls.static
from django.contrib import admin
import django.urls

urlpatterns = [
    django.urls.path('', django.urls.include('homepage.urls')),
    django.urls.path('articles/', django.urls.include('articles.urls')),
    django.urls.path('contact/', django.urls.include('contact.urls')),
    django.urls.path('admin/', admin.site.urls),
    django.urls.path('ckeditor5/', django.urls.include('django_ckeditor_5.urls')),
] + django.conf.urls.static.static(
    django.conf.settings.MEDIA_URL,
    document_root=django.conf.settings.MEDIA_ROOT,
)