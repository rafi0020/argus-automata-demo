# Demo Videos

Place your demo videos in this directory.

## Expected Files

| Filename | Module | Description |
|----------|--------|-------------|
| `intrusion_demo.mp4` | Perimeter Intrusion | Person entering restricted zone |
| `throwing_demo.mp4` | Throwing Detection | Person throwing waste |
| `vehicle_demo.mp4` | Vehicle Overspeed | Vehicle exceeding speed limit |
| `collision_demo.mp4` | Collision Risk | Near-miss between person and vehicle |
| `ppe_demo.mp4` | PPE Compliance | Worker with missing safety equipment |

## Video Requirements

- **Format**: MP4 with H.264 codec (for browser compatibility)
- **Resolution**: 640x480 or 1280x720
- **Duration**: 10 seconds (recommended)
- **Frame Rate**: 25 FPS

## No Video? No Problem!

If videos are not present, the system automatically uses **Canvas Simulation Mode** which renders animated shapes based on the JSON detection data.

## Generating Videos

See `/docs/VIDEO_PROMPTS.md` for AI video generation prompts you can use with:
- Google Veo 3
- Runway Gen-3
- Pika Labs
- Or any AI video generator

## Converting Videos

```bash
# Convert to H.264 MP4
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -c:a aac output.mp4

# Resize to 640x480
ffmpeg -i input.mp4 -vf "scale=640:480" -c:v libx264 output.mp4
```

