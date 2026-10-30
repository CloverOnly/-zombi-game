# CC0 first-person hand revision — 2026-10-30

## Actual downloaded sources

1. **Hand - Realistic**, by **Dan Ulrich**, distributed by Blender Studio in **Human Base Meshes v1.4.1**. The asset metadata identifies it as a scan-data-derived hand with multiresolution detail and declares **CC0**.
   - Official listing: https://www.blender.org/download/demo-files/#assets
   - Download: https://download.blender.org/demo/asset-bundles/human-base-meshes/human-base-meshes-bundle-v1.4.1.zip
   - Downloaded 2026-10-30, without an account.
   - Archive SHA-256: `811f43accbb31a88266d932f8f5563b2d13586fca0ba2693aad1f5fe582b3515`.
   - The original hand and its asset metadata are retained in `source/studio-hand-original.blend`.
2. **para / MakeHuman FPS arms**, **CC0**. Used for the existing actual arm mesh, original skin color image and rig. https://opengameart.org/content/fps-arms-rigged-only
   - Original archive is retained in `source/fps-arms.7z`.
3. **Jogging Melange**, photography by **colormass**, processing by **Rico Cilliers**, **CC0**. Actual diffuse, OpenGL normal and roughness maps were downloaded from Poly Haven's public API. https://polyhaven.com/a/jogging_melange
   - API provenance and original download URLs/MD5 hashes are in `source/fabric-info.json` and `source/fabric-files.json`.
   - The source maps were re-encoded to 1024px PNG for the runtime; material tint is applied separately.

CC0 permits commercial use and modification: https://creativecommons.org/publicdomain/zero/1.0/ . Poly Haven's asset license: https://polyhaven.com/license . Attribution is retained for provenance even though CC0 does not require it.

## Authored changes

- Replaced the old hand geometry with the actual Blender Studio hand, fitted it to a right-hand rig and adjusted thumb phalanx proportions.
- Authored a parallel-plane cylindrical power grip with an opposing thumb. Added `Grip_R` to the exported skeleton, so the weapon uses the same authored socket in the editor and game.
- Transferred the existing MakeHuman skin color onto the new hand's UV layout. **This is still derived from the original 1024px color source; it is not a new high-resolution skin photograph.**
- Authored 2048px skin micro-normal and roughness maps, with a nail roughness mask. **These are authored maps, not downloaded skin-scan maps.**
- Sculpted a small local grip corrective on 105 vertices (maximum approximately 3.85mm), and retained the actual hand topology and skinning.
- Used the original arm mesh to author a cloth sleeve and cuff, with real Poly Haven PBR textures; no box, sphere or capsule limb substitute was created.
- Authored Idle, Walk, Run and Attack skeletal clips, retaining the existing combat clock in the application.

`source/hand-rigged.blend` contains the editable rig, meshes, actions and packed textures. The runtime loads `arms.gltf`, `arms.bin` and the six referenced texture images; it does not load the source Blend files.

The baseball bat is the existing CC0 Poly Haven **Baseball Bat** by Enrique Martín, stored separately in `assets/models/weapons/baseball-bat/`. Its geometry and textures are reused without changing the game's weapon rules. https://polyhaven.com/a/baseball_bat
