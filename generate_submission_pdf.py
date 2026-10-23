from PIL import Image, ImageDraw, ImageFont

def generate_pdf():
    # A4 dimensions at 300 DPI
    width, height = 2480, 3508
    image = Image.new("RGB", (width, height), "#ffffff")
    draw = ImageDraw.Draw(image)

    try:
        font_header = ImageFont.truetype("arialbd.ttf", 64)
        font_label = ImageFont.truetype("arialbd.ttf", 52)
        font_value = ImageFont.truetype("consola.ttf", 46)
        font_sub = ImageFont.truetype("arial.ttf", 42)
    except Exception:
        font_header = ImageFont.load_default()
        font_label = font_header
        font_value = font_header
        font_sub = font_header

    # Clean, simple black-and-white layout (no extra colors)
    x = 200
    y = 300

    draw.text((x, y), "ITUE301 Examination Submission", font=font_header, fill="#000000")
    y += 90
    draw.text((x, y), "Student ID: 24DCE070   |   Batch: 5CE1-C   |   Set: Set A", font=font_sub, fill="#333333")
    y += 70
    draw.line([(x, y), (width - x, y)], fill="#000000", width=3)
    y += 140

    # 1. Public GitHub Repository URL
    draw.text((x, y), "1. Public GitHub Repository URL:", font=font_label, fill="#000000")
    y += 80
    draw.text((x, y), "https://github.com/krupa070/itue301-exam-24DCE070-5CE1-C", font=font_value, fill="#000000")
    y += 180

    # 2. Final Commit SHA
    draw.text((x, y), "2. Final Commit SHA:", font=font_label, fill="#000000")
    y += 80
    draw.text((x, y), "9d307b1cf5d76e6b7d6c7a1b20c891bec24c5404", font=font_value, fill="#000000")
    y += 180

    draw.line([(x, y), (width - x, y)], fill="#cccccc", width=2)

    # Save to both required PDF names
    image.save("24DCE070-Set-A.pdf", "PDF", resolution=300.0)
    image.save("24DCE070-A.pdf", "PDF", resolution=300.0)
    print("Generated ultra-simple submission PDFs successfully.")

if __name__ == "__main__":
    generate_pdf()
