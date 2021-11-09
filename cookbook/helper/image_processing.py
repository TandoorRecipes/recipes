import os
import sys

from PIL import Image
from io import BytesIO


def rescale_image_jpeg(image_object, base_width=1020):
    img = Image.open(image_object)
    icc_profile = img.info.get('icc_profile')  # remember color profile to not mess up colors
    width_percent = (base_width / float(img.size[0]))
    height = int((float(img.size[1]) * float(width_percent)))

    img = img.resize((base_width, height), Image.ANTIALIAS)
    img_bytes = BytesIO()
    img.save(img_bytes, 'JPEG', quality=90, optimize=True, icc_profile=icc_profile)

    return img_bytes


def rescale_image_png(image_object, base_width=1020):
    wpercent = (base_width / float(image_object.size[0]))
    hsize = int((float(image_object.size[1]) * float(wpercent)))
    img = image_object.resize((base_width, hsize), Image.ANTIALIAS)

    im_io = BytesIO()
    img.save(im_io, 'PNG', quality=90)
    return img


def get_filetype(name):
    try:
        return os.path.splitext(name)[1]
    except Exception:
        return '.jpeg'


def handle_image(request, image_object, filetype='.jpeg'):
    if (image_object.size / 1000) > 500:  # if larger than 500 kb compress
        if filetype == '.jpeg' or filetype == '.jpg':
            return rescale_image_jpeg(image_object), filetype
        if filetype == '.png':
            return rescale_image_png(image_object), filetype
    return image_object, filetype
