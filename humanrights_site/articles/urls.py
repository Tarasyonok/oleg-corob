import django.urls
import articles.views

app_name = 'articles'
urlpatterns = [
    django.urls.path('', articles.views.ArticleListView.as_view(), name='article-list'),
    django.urls.path('<int:pk>/', articles.views.ArticleDetailView.as_view(), name='article-detail'),
]