import django.views.generic
import django.shortcuts
import django.urls

import articles.models

class HomeView(django.views.generic.TemplateView):
    template_name = "homepage/home.html"


class AboutView(django.views.generic.TemplateView):
    def get(self, request, *args, **kwargs):
        return django.shortcuts.redirect(django.urls.reverse("homepage:home"))


# class StaticPageView(django.views.generic.TemplateView):
#     template_name = "static/{}.html"
#
#     def get_template_names(self):
#         page_name = self.kwargs.get('page_name')
#         return [self.template_name.format(page_name)]

