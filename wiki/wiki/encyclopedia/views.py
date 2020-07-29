from django.http import Http404
from django.http import HttpResponse, HttpResponseRedirect
from . import util

from django.shortcuts import render
from django import forms
from django.urls import reverse

class searchForm(forms.Form):
    q = forms.CharField(label="entry")

class newPageForm(forms.Form):
    title = forms.CharField(label="title")
    content = forms.CharField(label="description",
            widget=forms.Textarea(attrs={'placeholder': 'Description'}))
    # content = forms.CharField(label="Description") #default widget for CharField is TextInput

class editPageForm(forms.Form):
    # title = forms.CharField(label="title", disabled=True)
    # title = forms.CharField(label="title")
    content = forms.CharField(label="description", widget=forms.Textarea)

def index(request):
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries(),
        "form": searchForm()
    })


def title(request, title):
    content = util.get_entry(title)
    if content is not None:
        # return util.render_title(request, title, content)
        return render(request, "encyclopedia/title.html", {
            "title": title,
            "content": content,
            "form": searchForm()
        })
    else:
        raise Http404("Entry does not exist")
        # raise Http404() # used in production
    
def search(request):
    query = request.GET.get('q') #entry title if exists
    content = util.get_entry(query)
    if content is not None:
        # return util.render_title(request, query, content)
        return render(request, "encyclopedia/title.html", {
            "title": query,
            "content": content,
            "form": searchForm()
        })
    else:
        entries = util.list_entries()
        have_as_substr = []
        for entry in entries:
            if entry.find(query) != -1:
                have_as_substr.append(entry)
        return render(request, "encyclopedia/search.html", {
            "title": query,
            "entries": have_as_substr,
            "form": searchForm()
        })

def newpage(request):
    if request.method == 'GET':
        return render(request, "encyclopedia/newpage.html", {
                "form": searchForm(),
                "newPageForm": newPageForm()
            })
    elif request.method == 'POST':
        form = newPageForm(request.POST) #taking all the data user submitted
        if form.is_valid():   #https://docs.djangoproject.com/en/3.0/ref/forms/api/#accessing-clean-data
            title = form.cleaned_data["title"]   #dictionary created from the submitted form
            content = util.get_entry(title)
            if content:
                return render(request, "encyclopedia/title.html", {
                    "title": title,
                    "content": content,
                    "form": searchForm()
                })
            else:
                content = form.cleaned_data["content"]
                util.save_entry(title, content)
                return HttpResponseRedirect(reverse("encyclopedia:index"), {
                    "title": title,
                    "content": content,
                    "form": searchForm()
                })
                # return render(request, "encyclopedia/title.html", {
                #     "title": title,
                #     "content": content,
                #     "form": searchForm()
                # })
        else:
            return render(request, "encyclopedia/newpage.html", {
                "form": searchForm(),
                "newPageForm": form
            })


def edit(request, title):
    if request.method == 'POST':
        form = editPageForm(request.POST)
        if form.is_valid():
            content = form.cleaned_data["content"]
            util.save_entry(title, content)
            return HttpResponseRedirect(reverse("encyclopedia:index"), {
                "title": title,
                "content": content,
                "form": searchForm()
            })
        else:
            raise Http404("eerror while posting") 
    elif request.method == "GET":
        content = util.get_entry(title)
        return render(request, "encyclopedia/edit.html", {
                "title": title,
                "editPageForm": editPageForm({'title': title, 'content':content}),
                "form": searchForm()
            })
    
def randompage(request):
    title = util.get_rand_entry()
    content = util.get_entry(title)
    return HttpResponseRedirect(reverse("encyclopedia:title", args= [title]), {
                "title": title,
                "content": content,
                "form": searchForm()
            })
    # return render(request, "encyclopedia/title.html", {
    #             "title": title,
    #             "content": content,
    #             "form": searchForm()
    #         })


def delete(request, title):
    util.delete_entry(title)
    return HttpResponseRedirect(reverse("encyclopedia:index"), {
                "form": searchForm()
            })