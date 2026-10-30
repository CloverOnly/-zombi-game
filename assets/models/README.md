# Runtime 3D models

The game loads the files in this directory through the bundled Three.js r154 GLTFLoader.
Launch with `플레이하기.cmd` so GLB and glTF files can be fetched over local HTTP.

## Zombies

- `zombies/infected-city-man/` — **Male City Zombie** by Rikindle3D, [source and CC0 license](https://opengameart.org/content/male-city-zombie-ready-for-use-in-game-engines). Downloaded 2026-10-28. The original FBX model and animation files were converted locally to glTF 2.0 `.glb` using [FBX2glTF 0.13.1](https://github.com/godotengine/FBX2glTF). The runtime loads the skinned character, Idle, Walk, Attack and Death GLB clips, plus its original base-color and normal textures. The character has damaged skin and clothing. It is a game-ready zombie model, not photorealistic.

## Weapons

- `weapons/baseball-bat/baseball_bat.gltf`, `.bin`, and three textures — **Baseball Bat** by Enrique Martín, [asset page](https://polyhaven.com/a/baseball_bat), [Poly Haven license](https://polyhaven.com/license), CC0. Downloaded 2026-10-28 from the Poly Haven API at `https://api.polyhaven.com/files/baseball_bat`, 1K glTF variant. The model includes diffuse, OpenGL normal and AO/roughness/metalness textures.

## Environment

- `environment/wooden-table/wooden_table_02.gltf`, `.bin`, and three textures — **Wooden Table 02** by Serhii Khromov, [asset page](https://polyhaven.com/a/wooden_table_02), [Poly Haven license](https://polyhaven.com/license), CC0. Downloaded 2026-10-28 from `https://api.polyhaven.com/files/wooden_table_02`, 1K glTF variant. Used for the starting bedroom's vanity table. The mirror, stool, room walls and collision geometry remain the existing game objects.
- `environment/vintage-day-bed/vintage_day_bed.gltf`, `.bin`, and three textures — **Vintage Day Bed** by Aron Łyczek, [asset page](https://polyhaven.com/a/vintage_day_bed), [Poly Haven license](https://polyhaven.com/license), CC0. Downloaded 2026-10-28 from `https://api.polyhaven.com/files/vintage_day_bed`, 1K glTF variant. Replaces the starting bedroom's primitive bed visual while keeping its collision footprint. This is an aged bed style and changes the room's appearance.
