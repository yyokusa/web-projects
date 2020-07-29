from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.shortcuts import render
from django.urls import reverse


from .models import User, Listing, Category, Watchlist, Comment, Bid

from django.forms import ModelForm
from django import forms
from django.contrib.auth.decorators import login_required
from django.shortcuts import (
    get_object_or_404,
)  # https://stackoverflow.com/a/17815743/10902172


class ListingForm(ModelForm):
    """
    If the model field has blank=True, then required is set to False on the form field.
    Otherwise, required=True.
    """

    class Meta:
        model = Listing
        fields = ["title", "description", "starting_bid", "category"]


class CommentForm(ModelForm):
    class Meta:
        model = Comment
        fields = ["comment_title", "comment_body", "commenter", "listing"]
        widgets = {"commenter": forms.HiddenInput(), "listing": forms.HiddenInput()}

class BidForm(ModelForm):
    class Meta:
        model = Bid
        fields = ["bid_value",  "bid_caller", "listing"]
        widgets = {"listing": forms.HiddenInput(), "bid_caller": forms.HiddenInput()}

class CloseListingForm(ModelForm):

    class Meta:
        model = Listing
        fields = ["title"]
        widgets = {"title": forms.HiddenInput()}


def index(request):
    return render(
        request, "auctions/index.html",
        {
            "all_listings": Listing.objects.filter(active=True),
        },
    )


@login_required
def user_listings(request):
    # https://stackoverflow.com/a/2642645/10902172 #related_name
    # https://docs.djangoproject.com/en/dev/topics/db/queries/#following-relationships-backward
    listings = request.user.owner_listings_set.all()
    return render(request, "auctions/user_listings.html", {"all_listings": listings})


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(
                request,
                "auctions/login.html",
                {"message": "Invalid username and/or password."},
            )
    else:
        return render(request, "auctions/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(
                request, "auctions/register.html", {"message": "Passwords must match."}
            )

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
            watchlist = Watchlist(user=user)
            watchlist.save()
        except IntegrityError:
            return render(
                request,
                "auctions/register.html",
                {"message": "Username already taken."},
            )
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")


@login_required
def create_listing(request):
    if request.method == "POST":
        form = ListingForm(request.POST)  # taking all the data user submitted
        if (
            form.is_valid()
        ):  # https://docs.djangoproject.com/en/3.0/ref/forms/api/#accessing-clean-data
            
            title = form.cleaned_data["title"]
            description = form.cleaned_data["description"]
            starting_bid = form.cleaned_data["starting_bid"]
            category = form.cleaned_data["category"]
            
            owner = request.user
            new_listing = Listing(
                title=title,
                description=description,
                starting_bid=starting_bid,
                highest_bid_owner=owner,
                owner=owner,
                category=category,
            )
            # https://docs.djangoproject.com/en/3.0/topics/forms/modelforms/#the-save-method
            new_listing.save()
            return HttpResponseRedirect(
                reverse("index"),
                # {"listing": Listing.objects.all()}
            )
        return render(request, "auctions/create_listing.html", {"form": ListingForm()})
    elif request.method == "GET":
        return render(request, "auctions/create_listing.html", {"form": ListingForm()})


def listing_page(request, listing_no):
    listing = Listing.objects.get(pk=listing_no)
    comment_form_data = {"commenter": request.user, "listing": listing}
    comment_form = CommentForm(initial=comment_form_data)
    bid_form_data = {
        "bid_value": listing.starting_bid,
        "bid_caller": request.user,
        "listing": listing,
    }
    bid_form = BidForm(initial=bid_form_data)
    close_listing_form_data = {"title": listing.title}
    close_listing_form = CloseListingForm(initial=close_listing_form_data)
    return render(
        request,
        "auctions/listing_page.html",
        {
            "listing": listing,
            "comment_form": comment_form,
            "bid_form": bid_form,
            "close_listing_form": close_listing_form
        },
    )


@login_required
def watchlist(request):
    if request.method == "POST":
        """
            You add item into watchlist, when you want to list them
            use this: 
            items = get_object_or_404(Watchlist, user=request.user.id)
            Adding item into a user's watchlist only works with users registered through site, try to implement this for users created via admin interface and admin itself.
        """
        listing = Listing.objects.get(id=int(request.POST["listing_id"]))
        # request.user is current logged-in user if user logged in.
        # request.user is User model object.
        watchlist = get_object_or_404(Watchlist, user=request.user)

        if request.POST["modify"] == "Add to Watchlist":
            watchlist.watchlist_items.add(listing)  # change field
            watchlist.save()  # this will update only
            return HttpResponseRedirect(
                reverse("index"), {"all_listings": Listing.objects.all(),},
            )
        elif request.POST["modify"] == "Remove from Watchlist":
            watchlist.watchlist_items.remove(listing)  # change field
            watchlist.save()  # this will update only
            all_items = watchlist.watchlist_items.all()
            return HttpResponseRedirect(
                reverse("watchlist"), {"all_watchlist_items": all_items,},
            )
    elif request.method == "GET":
        watchlist = get_object_or_404(Watchlist, user=request.user)
        all_items = watchlist.watchlist_items.all()
        return render(
            request, "auctions/watchlist.html", {"all_watchlist_items": all_items,},
        )


def category(request, category_name):

    specified_category = Category.objects.get(category_name=category_name)
    all_specified_category_listings = specified_category.category_listings_set.all()

    return render(
        request,
        "auctions/category.html",
        {
            "category_listings": all_specified_category_listings,
            "category_name": category_name,
        },
    )


def categories(request):

    categories = Category.objects.all()

    return render(request, "auctions/categories.html", {"categories": categories},)

@login_required
def publish_comment(request):
    # CommentForm()
    # if this is a POST request we need to process the form data
    if request.method == "POST":
        # create a form instance and populate it with data from the request:
        form = CommentForm(request.POST)
        # check whether it's valid:
        if form.is_valid():

            comment_title = form.cleaned_data["comment_title"]
            comment_body = form.cleaned_data["comment_body"]
            commenter = form.cleaned_data["commenter"]
            listing = form.cleaned_data["listing"]

            new_comment = Comment(
                comment_title=comment_title,
                comment_body=comment_body,
                commenter=commenter,
                listing=listing,
            )
            new_comment.save()
            return HttpResponseRedirect(
                reverse("listing_page", kwargs={"listing_no": listing.id})
            )
    # if a GET (or any other method) we'll return 404 page
    raise Http404("Page does not exist")

@login_required
def bid_item(request):

    if request.method == "POST":
        # create a form instance and populate it with data from the request:
        form = BidForm(request.POST)
        # check whether it's valid:
        if form.is_valid():
            # dictionary created from the submitted form
            bid_value = form.cleaned_data["bid_value"]
            bid_caller = form.cleaned_data["bid_caller"]
            listing = form.cleaned_data["listing"]
            
            highest_bid = int(listing.starting_bid)

            bid_form_data = {
                "bid_value": listing.starting_bid,
                "bid_caller": request.user,
                "listing": listing,
            }
            comment_form_data = {"commenter": request.user, "listing": listing}
            close_listing_form_data = {"title": listing.title}
            bid_form = BidForm(initial=bid_form_data)
            comment_form = CommentForm(initial=comment_form_data)
            close_listing_form = CloseListingForm(initial=close_listing_form_data)
            if bid_value <= highest_bid:
                # read about redirect and change render with redirect maybe
                # ? which one is better?
                return render(
                    request,
                    "auctions/listing_page.html",
                    {
                        "listing": listing,
                        "comment_form": comment_form,
                        "bid_form": bid_form,
                        "close_listing_form": close_listing_form,
                        "error_message": f"You should make a bid higher than {highest_bid}.",
                    },
                )
            else:

                bid_caller = request.user
                new_bid = Bid(
                    bid_value=bid_value, bid_caller=bid_caller, listing=listing,
                )
                new_bid.save()
                listing.starting_bid = bid_value  # change field
                listing.highest_bid_owner = bid_caller
                listing.save()  # this will update only

                return HttpResponseRedirect(
                    reverse("listing_page", kwargs={"listing_no": listing.id}),
                )
        # implement better validation
        # TODO
        else:
            return render(request, "<h1> FORM IS NOT VALID </h1>")
    else:
        raise Http404("Page does not exist")

@login_required
def close_listing(request):
    if request.method == "POST":
        form = CloseListingForm(request.POST)
        if form.is_valid():
            listing_title = form.cleaned_data["title"]
            listing = Listing.objects.get(title=listing_title)
            listing.active = False
            listing.winner = listing.highest_bid_owner
            listing.save()
            return HttpResponseRedirect(
                reverse("index"),
            )
    else:
        raise Http404("Page does not exist")


def listings_closed(request):
    return render(
        request, "auctions/listings_closed.html",
        {
            "all_items": Listing.objects.filter(active=False),
        },
    )