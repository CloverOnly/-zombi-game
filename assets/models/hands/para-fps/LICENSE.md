# FPS arms — source and modifications

- Model and original skin color texture: **para**, mesh/skin originally made with **MakeHuman**.
- Source: https://opengameart.org/content/fps-arms-rigged-only
- Original archive: https://opengameart.org/sites/default/files/fps%20arms.7z
- Declared license: **CC0 1.0**, https://creativecommons.org/publicdomain/zero/1.0/
- Commercial use and modification are permitted; attribution is appreciated but not required by CC0.
- Downloaded: 2026-10-29. Original archive retained in `source/fps-arms.7z`.

Local modifications: retained the original right arm geometry and skin weights, removed the left arm, changed the IK target into a continuous FK forearm/wrist chain, authored a cylindrical grip and Idle/Walk/Run/Attack skeletal animation clips, exported glTF using official Blender 4.2.9.

`new_diff.png` is the source's 1024px skin color image. `skin_normal.png` and `skin_roughness.png` are locally authored procedural microdetail maps baked in Blender. **They are not downloaded skin scans or high-poly anatomical bakes.** The original source only provides diffuse color and a rig/test animation.

The game adds a non-deforming `Grip_R` bone/socket under the actual hand bone. The held weapon is Poly Haven's CC0 Baseball Bat by Enrique Martín, already distributed in `assets/models/weapons/baseball-bat/` with its own 1K color/normal/ARM maps; its geometry and textures have not been replaced with primitives.
