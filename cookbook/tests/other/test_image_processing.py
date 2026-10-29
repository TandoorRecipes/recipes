from io import BytesIO

from PIL import Image

from cookbook.helper.image_processing import rescale_image_jpeg, strip_image_meta


def oriented_jpeg():
    image = Image.new('RGB', (20, 10))
    exif = image.getexif()
    exif[0x0112] = 6

    image_bytes = BytesIO()
    image.save(image_bytes, 'JPEG', exif=exif)
    image_bytes.seek(0)
    return image_bytes


def test_rescale_image_jpeg_applies_exif_orientation():
    result = rescale_image_jpeg(oriented_jpeg(), base_width=10)

    with Image.open(result) as image:
        assert image.size == (10, 20)
        assert image.getexif().get(0x0112) is None


def test_strip_image_meta_applies_exif_orientation():
    result = strip_image_meta(oriented_jpeg(), 'JPEG')

    with Image.open(result) as image:
        assert image.size == (10, 20)
        assert image.getexif().get(0x0112) is None


def test_rescale_image_jpeg_does_not_upscale_small_images():
    image_bytes = BytesIO()
    Image.new('RGB', (20, 10)).save(image_bytes, 'JPEG')
    image_bytes.seek(0)

    result = rescale_image_jpeg(image_bytes, base_width=1020)

    with Image.open(result) as image:
        assert image.size == (20, 10)
