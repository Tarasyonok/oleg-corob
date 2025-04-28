import django.db.models
import django.utils.timezone
import django_ckeditor_5.fields


class Article(django.db.models.Model):
    class LanguageChoices(django.db.models.TextChoices):
        ENGLISH = 'en', 'English'
        RUSSIAN = 'ru', 'Russian'
        ITALIAN = 'it', 'Italian'
        SLOVENIAN = 'sl', 'Slovenian'

    class TopicChoices(django.db.models.TextChoices):
        LEGAL = 'legal', 'Legal Framework'
        CASES = 'cases', 'Case Studies'
        NEWS = 'news', 'News & Updates'

    title = django.db.models.CharField(max_length=200)
    content = django_ckeditor_5.fields.CKEditor5Field()
    created_at = django.db.models.DateTimeField(default=django.utils.timezone.now)
    updated_at = django.db.models.DateTimeField(auto_now=True)

    language = django.db.models.CharField(
        max_length=2,
        choices=LanguageChoices,
        default='en',
    )

    topic = django.db.models.CharField(
        max_length=20,
        choices=TopicChoices,
        default=TopicChoices.NEWS,
        blank=True,
    )

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']


class Attachment(django.db.models.Model):
    article = django.db.models.ForeignKey(
        Article,
        on_delete=django.db.models.CASCADE,
        related_name='attachments'
    )
    file = django.db.models.FileField(
        upload_to='attachments/%Y/%m/%d/',
        verbose_name="File"
    )
    name = django.db.models.CharField(
        max_length=100,
        blank=True,
    )

    def __str__(self):
        return self.name if self.name else f"Attachment {self.id}"

    def save(self, *args, **kwargs):
        if not self.name and self.file:
            self.name = self.file.name
        super().save(*args, **kwargs)
