from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "assets" / "team"

NOTEBOOK_SRC = Path(
    "/Users/ning/Library/Application Support/LarkShell/sdk_storage/"
    "f3b9f203def1051a643e85ed9e885fd7/resources/images/"
    "img_v3_0213j_e47bcdb5-334b-41e3-8e67-a04d9c06187g.jpg"
)
MINIAPP_SRC = Path(
    "/Users/ning/Library/Application Support/LarkShell/sdk_storage/"
    "f3b9f203def1051a643e85ed9e885fd7/resources/images/"
    "img_v3_0213j_4b8d404f-869f-4342-8189-e30e326fb5eg.jpg"
)
APP_SRC = Path(
    "/private/var/folders/ky/gbkzx1j5325gydr405z2y_d40000gn/T/"
    "codex-clipboard-086714a1-86a0-48d0-a6aa-0ce49f647852.png"
)

CANVAS = (900, 1200)
BG = (255, 255, 255)


def rounded_mask(size, radius):
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size[0], size[1]), radius=radius, fill=255)
    return mask


def paste_with_shadow(canvas, subject, xy, radius=0, shadow=26, opacity=58):
    x, y = xy
    alpha = subject.getchannel("A") if subject.mode == "RGBA" else Image.new("L", subject.size, 255)
    if radius:
        alpha = Image.composite(alpha, Image.new("L", subject.size, 0), rounded_mask(subject.size, radius))

    shadow_layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    shadow_alpha = alpha.filter(ImageFilter.GaussianBlur(shadow))
    shadow_img = Image.new("RGBA", subject.size, (36, 44, 32, opacity))
    shadow_layer.paste(shadow_img, (x, y + 18), shadow_alpha)
    canvas.alpha_composite(shadow_layer)
    canvas.paste(subject, (x, y), alpha)


def cover_crop(img, box, target_size):
    crop = img.crop(box)
    target_w, target_h = target_size
    scale = max(target_w / crop.width, target_h / crop.height)
    resized = crop.resize((round(crop.width * scale), round(crop.height * scale)), Image.Resampling.LANCZOS)
    left = (resized.width - target_w) // 2
    top = (resized.height - target_h) // 2
    return resized.crop((left, top, left + target_w, top + target_h))


def make_notebook():
    img = Image.open(NOTEBOOK_SRC).convert("RGBA")
    polygon = [(35, 557), (904, 475), (928, 1772), (76, 1818)]
    bbox = (0, 420, 970, 1988)
    cropped = img.crop(bbox)

    mask = Image.new("L", cropped.size, 0)
    local_poly = [(x - bbox[0], y - bbox[1]) for x, y in polygon]
    ImageDraw.Draw(mask).polygon(local_poly, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(1.6))

    subject = Image.new("RGBA", cropped.size, (0, 0, 0, 0))
    subject.paste(cropped, (0, 0), mask)

    # Tighten transparent bounds after masking so the object can be composed consistently.
    alpha_bbox = subject.getchannel("A").getbbox()
    subject = subject.crop(alpha_bbox)
    target_w = 640
    target_h = round(subject.height * (target_w / subject.width))
    subject = subject.resize((target_w, target_h), Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", CANVAS, BG + (255,))
    paste_with_shadow(canvas, subject, ((CANVAS[0] - target_w) // 2, 90), shadow=20, opacity=48)
    canvas.convert("RGB").save(OUT / "practice-notebook.png", quality=95)


def make_miniapp():
    img = Image.open(MINIAPP_SRC).convert("RGBA")
    crop = img.crop((0, 0, 1080, 1735))
    target_w = 650
    target_h = round(crop.height * (target_w / crop.width))
    phone = crop.resize((target_w, target_h), Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", CANVAS, BG + (255,))
    paste_with_shadow(canvas, phone, ((CANVAS[0] - target_w) // 2, 34), radius=50, shadow=22, opacity=42)
    canvas.convert("RGB").save(OUT / "practice-miniapp.png", quality=95)


def make_app():
    img = Image.open(APP_SRC).convert("RGBA")
    # Keep the centered App state: sentence + character + phone frame.
    crop = cover_crop(img, (0, 34, img.width, 822), (520, 900))
    target_h = 1030
    target_w = round(crop.width * (target_h / crop.height))
    phone = crop.resize((target_w, target_h), Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", CANVAS, BG + (255,))
    paste_with_shadow(canvas, phone, ((CANVAS[0] - target_w) // 2, 72), radius=62, shadow=22, opacity=42)
    canvas.convert("RGB").save(OUT / "practice-app.png", quality=95)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    make_notebook()
    make_miniapp()
    make_app()


if __name__ == "__main__":
    main()
