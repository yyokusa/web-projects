from django.contrib import admin

# Register your models here.
from .models import User, Category, Watchlist, Listing, Bid, Comment

admin.site.register(User)
admin.site.register(Category)
admin.site.register(Watchlist)
admin.site.register(Listing)
admin.site.register(Bid)
admin.site.register(Comment)