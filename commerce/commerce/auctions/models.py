from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass


class Category(models.Model):
    category_name = models.CharField(max_length=32, null=True)

    def __str__(self):
        return f"{self.category_name}"


class Listing(models.Model):
    # image = models.ImageField(upload_to="auctions/static/auctions/", null=True)
    title = models.CharField(max_length=32)
    description = models.CharField(max_length=64)
    starting_bid = models.PositiveIntegerField(default=1)
    highest_bid_owner = models.ForeignKey(
        User, related_name="user_highest_bid_listings_set", on_delete=models.CASCADE,
    )
    date = models.DateTimeField(auto_now_add=True)
    owner = models.ForeignKey(
        User, related_name="owner_listings_set", on_delete=models.CASCADE
    )
    category = models.ForeignKey(
        Category, related_name="category_listings_set", on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    active = models.BooleanField(default=True)
    winner = models.ForeignKey(
        User, related_name="user_wins_set", on_delete=models.CASCADE,
        null=True,
        blank=True
        # https://docs.djangoproject.com/en/3.0/ref/models/fields/#null
        # https://docs.djangoproject.com/en/3.0/ref/models/fields/#blank
    )

class Watchlist(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE,)
    # https://docs.djangoproject.com/en/3.0/topics/db/queries/#many-to-many-relationships
    watchlist_items = models.ManyToManyField(
        Listing, null=True
    )  # null has no effect on ManyToManyField.


class Bid(models.Model):
    bid_value = models.PositiveIntegerField(default=1,)
    bid_caller = models.ForeignKey(
        User, related_name="user_bids", on_delete=models.CASCADE
    )
    listing = models.ForeignKey(
        Listing, related_name="listing_bids", on_delete=models.CASCADE
    )


class Comment(models.Model):
    comment_title = models.CharField(max_length=32)
    comment_body = models.CharField(max_length=64)
    commenter = models.ForeignKey(
        User, related_name="user_comments", on_delete=models.CASCADE
    )
    listing = models.ForeignKey(
        Listing, related_name="listing_comments", on_delete=models.CASCADE,
    )
