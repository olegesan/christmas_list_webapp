from django.contrib import admin
from .models import Gift, Profile, Family
# Register your models here.
admin.site.register(Profile)
admin.site.register(Gift)
admin.site.register(Family)
