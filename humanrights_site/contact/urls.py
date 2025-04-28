import django.urls
import contact.views

app_name = 'contact'
urlpatterns = [
    django.urls.path('', contact.views.ContactView.as_view(), name='contact'),
]