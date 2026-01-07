# Profile Photos

This folder contains photorealistic AI-generated profile photos for the SoulMate demo.

## File Naming Convention
- `face-001.jpg` through `face-120.jpg`
- All images should be JPEG format
- Recommended size: 512x512 or higher
- Square aspect ratio preferred

## Requirements
- Photorealistic AI-generated faces only
- No real people
- Diverse genders, ethnicities, ages (18-40)
- Natural lighting and framing (selfie/portrait style)
- No watermarks

## Assignment
Photos are assigned deterministically using a hash of each profile's UUID.
The same profile will always display the same photo.

## Usage
Once images are added, the SoulMate feature will automatically use them.
The system falls back to a gradient placeholder if an image is missing.
