# AI Video Generation Prompts

Use these prompts with AI video generation tools (Google Veo, Runway, Pika, etc.) to create demo videos for each detection module.

## General Settings

- **Duration**: 10 seconds
- **Resolution**: 640x480 or 1280x720
- **Frame Rate**: 25-30 FPS
- **Style**: Industrial/surveillance camera footage
- **Color**: Slightly desaturated, typical CCTV look

---

## 1. Perimeter Intrusion Detection

### Prompt

```
Industrial security camera footage, static wide-angle shot of a restricted warehouse zone with yellow warning lines painted on the floor forming a rectangular boundary. A worker in a blue uniform slowly walks from outside the restricted area, crosses the yellow line boundary, and enters the forbidden zone. The lighting is fluorescent industrial lighting. The camera is mounted high looking down at approximately 45 degrees. Duration 10 seconds, realistic CCTV quality with slight motion blur.
```

### Key Elements
- Clear boundary markers (yellow lines)
- Person walking from safe zone to restricted zone
- Industrial warehouse setting
- Static camera angle

---

## 2. Throwing Detection

### Prompt

```
Industrial surveillance camera footage of a waste disposal area in a factory. A worker in safety gear stands near a large waste bin. The worker picks up debris from the floor and makes an overhand throwing motion, tossing items into the bin. The throwing action should be clear and visible, with arm extension and release. Static camera angle, industrial lighting, 10 seconds duration. The throwing action occurs between 3-7 seconds into the video.
```

### Key Elements
- Clear throwing gesture
- Waste disposal context
- Single person focus
- Distinct throwing vs normal poses

---

## 3. Vehicle Overspeed Detection

### Prompt

```
Security camera footage of an industrial facility internal road. A forklift or small utility vehicle drives through the frame from left to right, starting slowly then accelerating to an unsafe speed. The road has speed limit signs visible showing 30 km/h. The vehicle visibly speeds up midway through, creating urgency. Static overhead camera angle, concrete road surface, warehouse buildings in background. Duration 10 seconds, daytime lighting.
```

### Key Elements
- Vehicle moving through frame
- Visible acceleration
- Speed limit context (signs)
- Road/lane markings

---

## 4. Collision Risk Detection

### Prompt

```
Industrial warehouse interior surveillance footage. A pedestrian worker walks across a loading area while a forklift approaches from a perpendicular direction. The forklift and worker paths converge, creating a near-miss situation where they come dangerously close before the forklift stops. The worker is wearing high-visibility vest. Static wide-angle camera, fluorescent lighting, concrete floor with lane markings. Duration 10 seconds, the near-collision occurs around 4-5 seconds.
```

### Key Elements
- Person and vehicle in same frame
- Converging paths
- Near-miss moment
- Clear spatial relationship

---

## 5. PPE Compliance Detection

### Prompt

```
Factory floor surveillance camera footage. A worker enters frame wearing incomplete safety equipment - missing hard hat and safety vest, wearing only regular work clothes. The worker walks through a PPE-required zone marked with safety signs. Midway through, supervisor approaches and the worker puts on a hard hat and vest. Static camera, industrial setting with machinery in background, clear safety signage visible. Duration 10 seconds.
```

### Key Elements
- Worker with missing PPE items
- PPE-required zone signage
- Transition from non-compliant to compliant
- Clear visibility of PPE items (or lack thereof)

---

## Alternative: Stock Footage Keywords

If using stock footage sites, search for:

### Intrusion
- "warehouse security breach"
- "restricted area trespassing"
- "industrial zone entry"

### Throwing
- "factory worker disposing waste"
- "industrial throwing action"
- "warehouse debris disposal"

### Vehicle
- "forklift speeding warehouse"
- "industrial vehicle driving"
- "factory road traffic"

### Collision
- "forklift near miss pedestrian"
- "warehouse vehicle pedestrian"
- "industrial collision avoidance"

### PPE
- "worker without hard hat"
- "safety equipment violation"
- "PPE compliance factory"

---

## Post-Processing Tips

1. **Convert to H.264 MP4** for browser compatibility
2. **Resize to 640x480** if needed
3. **Add slight noise/grain** for CCTV realism
4. **Reduce saturation** slightly
5. **Ensure consistent frame rate** (25 FPS recommended)

### FFmpeg Commands

```bash
# Convert and resize
ffmpeg -i input.mp4 -vf "scale=640:480" -c:v libx264 -crf 23 output.mp4

# Add CCTV effect
ffmpeg -i input.mp4 -vf "scale=640:480,noise=c0s=10:c0f=t" -c:v libx264 output.mp4
```

---

## File Naming

Place generated videos in:
```
web/public/assets/videos/
├── intrusion_demo.mp4
├── throwing_demo.mp4
├── vehicle_demo.mp4
├── collision_demo.mp4
└── ppe_demo.mp4
```

The system will automatically detect and use these videos when available.

