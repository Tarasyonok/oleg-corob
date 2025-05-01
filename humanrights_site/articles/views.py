from datetime import datetime

import django.views.generic
import django.db.models
from django.utils import timezone

from .models import Article
import django.conf
import django.http
import django.views.generic


class ArticleListView(django.views.generic.ListView):
    model = Article
    template_name = "articles/list.html"
    context_object_name = "articles"
    paginate_by = 2

    def get_queryset(self):
        queryset = super().get_queryset()

        # Get all filter params from URL
        params = self.request.GET

        # 1. Text Search (Title + Content)
        if search := params.get('search'):
            queryset = queryset.filter(
                django.db.models.Q(title__icontains=search) |
                django.db.models.Q(content__icontains=search)
            )

        # 2. Language (Multiple Select)
        if languages := params.getlist('language'):
            queryset = queryset.filter(language__in=languages)

        # 3. Topic (Multiple Select)
        if topics := params.getlist('topic'):
            queryset = queryset.filter(topic__in=topics)

        # 4. Date Range
        date_from = params.get('date_from')
        date_to = params.get('date_to')
        print(date_from, date_to)

        if date_from:
            date_from = datetime.strptime(date_from, '%Y-%m-%d').date()
            queryset = queryset.filter(created_at__gte=date_from)
        if date_to:
            date_to = datetime.strptime(date_to, '%Y-%m-%d').date()
            queryset = queryset.filter(created_at__lte=date_to)

        # 5. Sorting
        sort = params.get('sort', '-created_at')  # Default: newest first
        if sort not in ['created_at', '-created_at']:
            sort = '-created_at'
        queryset = queryset.order_by(sort)

        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Pass current filter values to template
        context['current_filters'] = {
            'search': self.request.GET.get('search', ''),
            'languages': self.request.GET.getlist('language'),
            'topics': self.request.GET.getlist('topic'),
            'date_from': self.request.GET.get('date_from', ''),
            'date_to': self.request.GET.get('date_to', ''),
            'sort': self.request.GET.get('sort', '-created_at'),
        }
        context['LanguageChoices'] = [(choice.value, choice.label) for choice in Article.LanguageChoices]
        context['TopicChoices'] = [(choice.value, choice.label) for choice in Article.TopicChoices]
        return context


class ArticleDetailView(django.views.generic.DetailView):
    model = Article
    template_name = "articles/detail.html"
    context_object_name = "article"
    slug_field = "id"



def download_attachment(path):
    file_path = django.conf.settings.MEDIA_ROOT / path
    if file_path.exists():
        return django.http.FileResponse(
            file_path.open('rb'),
            as_attachment=True,
            filename=file_path.name,
            content_type='image',
        )

    return django.http.HttpResponseNotFound('Файл не найден')

