from PIL import Image
from io import BytesIO


def rescale_image(image_object, base_width=720):
    img = Image.open(image_object)
    icc_profile = img.info.get('icc_profile')  # remember color profile to not mess up colors
    width_percent = (base_width / float(img.size[0]))
    height = int((float(img.size[1]) * float(width_percent)))

    img = img.resize((base_width, height), Image.ANTIALIAS)
    img_bytes = BytesIO()
    img.save(img_bytes, 'JPEG', quality=75, optimize=True, icc_profile=icc_profile)

    return img_bytes
