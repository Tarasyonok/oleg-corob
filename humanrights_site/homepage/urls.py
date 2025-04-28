import django.urls

import homepage.views

app_name = 'homepage'
urlpatterns = [
    django.urls.path('', homepage.views.HomeView.as_view(), name='home'),
    django.urls.path('about/', homepage.views.AboutView.as_view(), name='about'),
    # django.urls.path("<str:page_name>/", homepage.views.StaticPageView.as_view(), name="static-page"),
]