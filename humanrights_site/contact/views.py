import django.views.generic
import django.urls

class ContactView(django.views.generic.TemplateView):
    template_name = "contact/contact.html"