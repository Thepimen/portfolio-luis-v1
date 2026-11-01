import os
import glob
from PIL import Image

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    frames_dir = os.path.join(base_dir, "frames")
    frame_files = sorted(glob.glob(os.path.join(frames_dir, "frame_*.png")))
    
    print(f"[+] Found {len(frame_files)} frames in {frames_dir}")
    if not frame_files:
        raise ValueError("No frames found!")
        
    # Durations in milliseconds for each frame
    # 1: Hero (2200ms)
    # 2: Command Palette (1800ms)
    # 3: Bento Grid (1800ms)
    # 4: VulnFollowUp (2200ms)
    # 5: kshield (1800ms)
    # 6: Terminal skills (1800ms)
    # 7: Terminal neofetch (2000ms)
    # 8: Trajectory timeline (2000ms)
    # 9: Light Theme (1800ms)
    # 10: Hero dark (1200ms)
    durations = [2200, 1800, 1800, 2200, 1800, 1800, 2000, 2000, 1800, 1200]
    
    target_width = 960
    target_height = 600
    
    processed_images = []
    for f in frame_files:
        img = Image.open(f).convert("RGBA")
        resized = img.resize((target_width, target_height), Image.Resampling.LANCZOS)
        # Convert to RGB with black background if transparent
        bg = Image.new("RGB", (target_width, target_height), (9, 10, 15))
        bg.paste(resized, mask=resized.split()[3])
        # Quantize to adaptive 256 colors with dithering for smooth gradients
        p_img = bg.convert("P", palette=Image.Palette.ADAPTIVE, colors=256)
        processed_images.append(p_img)
        
    output_dir = os.path.abspath(os.path.join(base_dir, "..", "assets"))
    os.makedirs(output_dir, exist_ok=True)
    out_path = os.path.join(output_dir, "portfolio_showcase.gif")
    
    # Also save a copy directly in the root directory for super easy access by the user
    root_out_path = os.path.abspath(os.path.join(base_dir, "..", "portfolio_showcase.gif"))
    
    print(f"[+] Compiling animated GIF to {out_path} ...")
    processed_images[0].save(
        out_path,
        save_all=True,
        append_images=processed_images[1:],
        duration=durations[:len(processed_images)],
        loop=0,
        optimize=True
    )
    
    size_mb = os.path.getsize(out_path) / (1024 * 1024)
    print(f"[+] Successfully generated: {out_path} ({size_mb:.2f} MB)")
    
    # Copy to root
    import shutil
    shutil.copyfile(out_path, root_out_path)
    print(f"[+] Copied to root: {root_out_path}")

if __name__ == "__main__":
    main()
