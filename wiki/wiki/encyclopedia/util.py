import re
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage

from random import randint
from markdown2 import markdown


def list_entries():
    """
    Returns a list of all names of encyclopedia entries.
    """
    _, filenames = default_storage.listdir("entries")
    return list(sorted(re.sub(r"\.md$", "", filename)
                for filename in filenames if filename.endswith(".md")))


def save_entry(title, content):
    """
    Saves an encyclopedia entry, given its title and Markdown
    content. If an existing entry with the same title already exists,
    it is replaced.
    """
    filename = f"entries/{title}.md"
    if default_storage.exists(filename):
        default_storage.delete(filename)
    default_storage.save(filename, ContentFile(content))


def get_entry(title):
    """
    Retrieves an encyclopedia entry by its title. If no such
    entry exists, the function returns None.
    """
    try:
        f = default_storage.open(f"entries/{title}.md")
        return get_html_from_markdown(f.read().decode("utf-8"))
    except FileNotFoundError:
        return None

def get_rand_entry():
    """
    Returns a title of a random encyclopedia entry. If no entry exists,
    the function returns None.
    """
    entries = list_entries()
    entries_size = len(entries)
    if not entries:
        return None
    title = entries[randint(0, entries_size - 1)]
    return title

def get_html_from_markdown(markdown_text):
    """
    Returns html text generated from markdown
    """
    html_text = markdown(markdown_text)
    return html_text

def delete_entry(title):
    """
    Deletes an encyclopedia entry, given its title and Markdown
    content.
    """
    filename = f"entries/{title}.md"
    if default_storage.exists(filename):
        default_storage.delete(filename)