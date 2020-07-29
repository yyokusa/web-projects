from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("listings_closed", views.listings_closed, name="listings_closed"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("create_listing", views.create_listing, name="create_listing"),
    path("user_listings", views.user_listings, name="user_listings"),
    path("listing_page/<int:listing_no>", views.listing_page, name="listing_page"),
    path("watchlist", views.watchlist, name="watchlist"),
    path("categories", views.categories, name="categories"),
    path("category/<str:category_name>", views.category, name="category"),
    path("publish_comment", views.publish_comment, name="publish_comment"),
    path("bid_item", views.bid_item, name="bid_item"),
    path("close_listing", views.close_listing, name="close_listing"),
]
