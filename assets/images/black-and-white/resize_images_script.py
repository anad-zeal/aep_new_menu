import os

from PIL import Image

# --- CONFIGURATION: EDIT THIS SECTION ---

# 1. The specific folder you want to process
target_folder = "."

# 2. The new dimensions
target_width = 1000
target_height = 800

# 3. Choose your resize mode (True or False)
FORCE_EXACT_SIZE = False

# ----------------------------------------


def process_images():
    if not os.path.exists(target_folder):
        print(f"Error: The folder '{target_folder}' does not exist.")
        return

    count = 0
    print(f"Processing images in: {target_folder}...")

    for filename in os.listdir(target_folder):
        # Check for valid image extensions
        if filename.lower().endswith(
            (".png", ".jpg", ".jpeg", ".tiff", ".bmp", ".gif")
        ):
            try:
                # Define path (same for input and output to overwrite)
                file_path = os.path.join(target_folder, filename)

                with Image.open(file_path) as img:
                    # Handle Convert to RGB to prevent errors with certain formats
                    if img.mode in ("RGBA", "P"):
                        img = img.convert("RGB")

                    if FORCE_EXACT_SIZE:
                        # Forces image to be exactly the dimensions (Stretches)
                        new_img = img.resize((target_width, target_height))
                        new_img.save(file_path)
                    else:
                        # Resizes to fit WITHIN dimensions (Maintains shapes)
                        # Note: Thumbnail modifies the image in-place
                        img.thumbnail((target_width, target_height))
                        img.save(file_path)

                    count += 1

            except Exception as e:
                print(f"  [ERROR] {filename}: {e}")

    print(f"Done! Overwrote {count} images.")


if __name__ == "__main__":
    process_images()
