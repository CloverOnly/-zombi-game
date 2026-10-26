# Poly Haven furniture assets

Downloaded from the official public API with the `PoyuHouseGame/1.0` user agent. All models and textures are CC0. Exact source/API URLs are in `sources.json` and each model's `source.json`. These are real mesh and PBR assets, not generated mockups.

Current user revision: the original beige sofa is restored and the living room coffee table is removed. `Sofa_01` and `modern_coffee_table_01` are retained as source files but are no longer loaded. Only bedding, dining chairs and dining table model files are active. The flashlight is now on the original sofa.

| Source | Use |
| --- | --- |
| [Sofa 01](https://polyhaven.com/a/Sofa_01) | Living room sofa |
| [Modern Coffee Table 01](https://polyhaven.com/a/modern_coffee_table_01) | Living room table |
| [Dining Chair 02](https://polyhaven.com/a/dining_chair_02) | Three dining chairs |
| [Dining Table](https://polyhaven.com/a/dining_table) | Dining table with cloth |
| [Gothic Bed 01](https://polyhaven.com/a/GothicBed_01) | Duvet and two pillows only; ornate frame excluded |
| [Leather White](https://polyhaven.com/a/leather_white) | Dark tinted gaming chair leather; diffuse, normal, roughness |
| [Wood Table](https://polyhaven.com/a/wood_table) | Master bedroom bed frame; normal and roughness maps, with the existing pale wood color |

Models use 1K maps. The five model scripts total about 8 MB before compression. `realistic-furniture.js` loads the local scripts progressively, keeps original furniture visible until a replacement succeeds, fits models to existing furniture bounds and puts them on the interior render layer. The gaming PC, monitors, desk and gaming chair geometry remain custom models; the gaming chair receives scanned leather maps.

The embedded scripts support the existing `file://` launcher without a local server. No remote API request is needed during play. Rebuild with `node qa/package-furniture.cjs`; re-download with `qa/fetch-furniture.ps1` and `qa/fetch-furniture-materials.ps1`. Original assets are retained alongside packaged scripts.

The Three.js r154 GLTFLoader and BufferGeometryUtils are from the official Three.js repository under MIT (see `../../THREE-LICENSE.txt`). `qa/package-furniture.cjs` adapts module imports/exports for the game's classic script loading; the loader behavior is unchanged.
