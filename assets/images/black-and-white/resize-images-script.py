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

# 4. Suffix to add to new files
SUFFIX = "_res"

# ----------------------------------------


def process_images():
    if not os.path.exists(target_folder):
        print(f"Error: The folder '{target_folder}' does not exist.")
        return

    count = 0
    print(f"Processing images in: {target_folder}...")

    for filename in os.listdir(target_folder):
        # Split the file into name and extension
        name, ext = os.path.splitext(filename)

        # 1. Check if it's an image
        # 2. Check if it already has the suffix (to prevent re-processing output files)
        if ext.lower() in (".png", ".jpg", ".jpeg", ".tiff", ".bmp", ".gif"):
            if name.endswith(SUFFIX):
                continue

            try:
                input_path = os.path.join(target_folder, filename)

                # Construct new filename: "image" + "_res" + ".jpg"
                new_filename = f"{name}{SUFFIX}{ext}"
                output_path = os.path.join(target_folder, new_filename)

                with Image.open(input_path) as img:
                    # Handle Convert to RGB
                    if img.mode in ("RGBA", "P"):
                        img = img.convert("RGB")

                    if FORCE_EXACT_SIZE:
                        # Forces exact size
                        new_img = img.resize((target_width, target_height))
                        new_img.save(output_path)
                    else:
                        # Fits within size
                        img.thumbnail((target_width, target_height))
                        img.save(output_path)

                    print(f"  [Created] {new_filename}")
                    count += 1

            except Exception as e:
                print(f"  [ERROR] {filename}: {e}")

    print(f"Done! Created {count} new images with suffix '{SUFFIX}'.")


if __name__ == "__main__":
    process_images()
