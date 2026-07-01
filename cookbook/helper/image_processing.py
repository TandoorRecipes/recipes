import os
from io import BytesIO

from PIL import Image


def rescale_image_jpeg(image_object, base_width=1020):
    img = Image.open(image_object)
    icc_profile = img.info.get('icc_profile')  # remember color profile to not mess up colors
    width_percent = (base_width / float(img.size[0]))
    height = int((float(img.size[1]) * float(width_percent)))

    img = img.resize((base_width, height), Image.LANCZOS)
    img_bytes = BytesIO()
    img.save(img_bytes, 'JPEG', quality=90, optimize=True, icc_profile=icc_profile)

    return img_bytes


def rescale_image_png(image_object, base_width=1020):
    image_object = Image.open(image_object)
    wpercent = (base_width / float(image_object.size[0]))
    hsize = int((float(image_object.size[1]) * float(wpercent)))
    img = image_object.resize((base_width, hsize), Image.LANCZOS)

    im_io = BytesIO()
    img.save(im_io, 'PNG', quality=90)
    return im_io


def rescale_image_webp(image_object, base_width=1020):
    image_object = Image.open(image_object)
    wpercent = (base_width / float(image_object.size[0]))
    hsize = int((float(image_object.size[1]) * float(wpercent)))
    img = image_object.resize((base_width, hsize), Image.LANCZOS)

    im_io = BytesIO()
    img.save(im_io, 'WEBP', quality=90)
    return im_io


def rescale_image_gif(image_object, base_width=1020):
    image_object = Image.open(image_object)
    im_io = BytesIO()
    
    if getattr(image_object, "is_animated", False):
        image_object.save(im_io, 'GIF', save_all=True)
    else:
        wpercent = (base_width / float(image_object.size[0]))
        hsize = int((float(image_object.size[1]) * float(wpercent)))
        img = image_object.convert('RGBA').resize((base_width, hsize), Image.LANCZOS).convert('P', dither=Image.NONE)
        img.save(im_io, 'GIF')
    return im_io


def get_filetype(name):
    try:
        return os.path.splitext(name)[1]
    except Exception:
        return '.jpeg'


def is_file_type_allowed(filename, image_only=False):
    is_file_allowed = False
    allowed_file_types = ['.pdf', '.docx', '.xlsx', '.css', '.mp4', '.mov']
    allowed_image_types = ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    check_list = allowed_image_types
    if not image_only:
        check_list += allowed_file_types

    for file_type in check_list:
        if filename.lower().endswith(file_type):
            is_file_allowed = True

    return is_file_allowed


def strip_image_meta(image_object, file_format):
    image_object = Image.open(image_object)

    if file_format == 'GIF':
        im_io = BytesIO()
        if getattr(image_object, "is_animated", False):
            image_object.save(im_io, file_format, save_all=True)
        else:
            image_object.save(im_io, file_format)
        return im_io

    data = list(image_object.getdata())
    image_without_exif = Image.new(image_object.mode, image_object.size)
    image_without_exif.putdata(data)

    im_io = BytesIO()
    image_without_exif.save(im_io, file_format)
    return im_io


# TODO this whole file needs proper documentation, refactoring, and testing
# TODO also add env variable to define which images sizes should be compressed
# filetype argument can not be optional, otherwise this function will treat all images as if they were a jpeg
# Because it's no longer optional, no reason to return it
def handle_image(request, image_object, filetype):
    try:
        Image.open(image_object).verify()
    except Exception:
        return None

    file_format = None
    if filetype == '.jpeg' or filetype == '.jpg':
        file_format = 'JPEG'
    elif filetype == '.png':
        file_format = 'PNG'
    elif filetype == '.webp':
        file_format = 'WEBP'
    elif filetype == '.gif':
        file_format = 'GIF'

    if not file_format:
        return image_object

    if (image_object.size / 1000) > 500:  # if larger than 500 kb compress
        if file_format == 'JPEG':
            return rescale_image_jpeg(image_object)
        elif file_format == 'PNG':
            return rescale_image_png(image_object)
        elif file_format == 'WEBP':
            return rescale_image_webp(image_object)
        elif file_format == 'GIF':
            return rescale_image_gif(image_object)

    return strip_image_meta(image_object, file_format)


def get_primary_recipe_image(recipe):
    """Return the primary RecipeImage for a recipe, or None (pattern-014).

    Determinism: the first image by (order, pk) that is_primary; if none is
    flagged primary, fall back to the first image overall by (order, pk).
    Iterates ``recipe.images.all()`` in Python so callers that
    ``prefetch_related('images')`` avoid an N+1 query.
    """
    images = sorted(recipe.images.all(), key=lambda i: (i.order, i.pk))
    if not images:
        return None
    return next((i for i in images if i.is_primary), images[0])


def set_primary_recipe_image(recipe, file, request=None, created_by=None):
    """Create a RecipeImage for a recipe (pattern-014: replaces writing the
    legacy Recipe.image column). The first image on a recipe is marked primary.

    :param recipe: Recipe instance the image belongs to
    :param file: an ImageField-compatible value (File/ImageFieldFile/path str)
    :param request: optional request, used to fall back for created_by
    :param created_by: optional explicit creator; defaults to
        recipe.created_by, then request.user
    :return: the created RecipeImage
    """
    # local import to avoid any import-cycle with cookbook.models
    from cookbook.models import RecipeImage

    creator = created_by or getattr(recipe, 'created_by', None)
    if creator is None and request is not None:
        creator = getattr(request, 'user', None)

    has_images = RecipeImage.objects.filter(recipe=recipe).exists()

    return RecipeImage.objects.create(
        recipe=recipe,
        file=file,
        is_primary=not has_images,
        order=0,
        space=recipe.space,
        created_by=creator,
    )
