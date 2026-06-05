from PIL import Image, ImageDraw, ImageFont
import os, subprocess

def find_font(size):
    candidates = [
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/Arial.ttf",
        "/Library/Fonts/Arial.ttf",
        "/System/Library/Fonts/SFNSDisplay.ttf",
        "/System/Library/Fonts/SFNS.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except:
                continue
    return ImageFont.load_default()

def make_icon(size, path):
    img = Image.new('RGB', (size, size), (0, 0, 0))
    draw = ImageDraw.Draw(img)
    center = size // 2

    # Draw white circle background
    pad = int(size * 0.08)
    draw.ellipse([pad, pad, size - pad, size - pad], fill=(255, 255, 255))

    # Draw black "C" letter big
    font_large = find_font(int(size * 0.52))
    font_small = find_font(int(size * 0.13))

    bbox = draw.textbbox((0, 0), "C", font=font_large)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text((center - tw // 2, center - th // 2 - int(size * 0.06)),
              "C", fill=(0, 0, 0), font=font_large)

    bbox2 = draw.textbbox((0, 0), "alAI", font=font_small)
    tw2 = bbox2[2] - bbox2[0]
    draw.text((center - tw2 // 2, center + int(size * 0.22)),
              "alAI", fill=(0, 0, 0), font=font_small)

    img.save(path)
    print(f"Saved {path} ({size}x{size})")

assets = os.path.join(os.path.dirname(__file__), '..', 'assets')
make_icon(1024, os.path.join(assets, 'icon.png'))
make_icon(1024, os.path.join(assets, 'android-icon-foreground.png'))
make_icon(512,  os.path.join(assets, 'favicon.png'))
make_icon(512,  os.path.join(assets, 'splash-icon.png'))
print("Done!")
