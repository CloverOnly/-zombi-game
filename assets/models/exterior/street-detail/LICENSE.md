# Street-view detail assets — 2026-10-30

All source assets listed below are **CC0**, allowing commercial use, modification and redistribution. Official license: https://polyhaven.com/license . Downloaded from the official public API without login. The game reads local files and does not call the API at runtime.

## New downloads applied

- **Modular Chainlink Fence**, James Ray Cock; wire material by Amal Kumar. https://polyhaven.com/a/modular_chainlink_fence
  - Used actual modeled posts and brackets. The chain-link wire is **not applied**, because the reference photographs show horizontal metal rails.
  - `reference-bollard.glb`: shortened source post, original modeled cap/foot detail, source bracket meshes as reflector bands.
  - `reference-horizontal-railing.glb`: actual source post meshes reshaped, rotated and joined into a five-rail module. It approximates the reference rail style; it is not an exact measured product.
  - Original glTF/BIN/JPEGs, source author metadata and URL/MD5 download manifests are retained in `modular_chainlink_fence/`.
- **Water Manhole Cover**, Raunox. https://polyhaven.com/a/water_manhole_cover
  - `reference-manhole.glb`: optimized actual cover and frame geometry with original photographic diffuse, normal and packed AO/roughness/metalness textures.
  - Original source files and download manifests are retained in `water_manhole_cover/`.
  - The embossed design differs from the Korean manhole in the photo; this is a visual substitute of the same object category.

## Existing downloaded source reused

- **Modular Urban Apartments Facade**, James Ray Cock. https://polyhaven.com/a/modular_urban_apartments_facade
  - Source retained in `../polyhaven-facade/`.
  - `reference-storefront.glb`: a real source glazing island edited into a wide pane, with modeled fence-kit metal profiles adapted as thin mullions/crossbars. Original normal/roughness data retained; glass uses a physical transparent material in Three.js.
  - Existing imported door models remain at two openings. A dedicated Korean cafe entrance model has not been acquired.

The source photographic post diffuse was recolored to dark/neutral metal while retaining its surface variation and UVs. Original normal and ARM maps remain. The source/manifests preserve the unchanged downloads for comparison.

## Editing and runtime

`reference-edits/reference-street-editable.blend` is an editable Blender source. `qa/build-reference-street.py` records the mesh editing, UV preservation and optimization. No new primitive box/cylinder is used as a runtime replacement prop or storefront model. Existing building foundations are still the game's earlier construction.

Runtime reads five GLB files under `reference-edits/`. Each embeds its textures. Shared instances reduce the replacement models to nine draw batches; the two authored road-number decals are separate flat road paint.

`reference-building-closure.glb` is a reduced 3m wall panel edited from the same CC0 facade kit. It closes the cafe floor, ceiling, walls, mullion seams, fascia and the parking turn chamber. The photographic base color was neutralized to gray; the original normal/roughness data remains. These are actual opaque surfaces, with no new box/cylinder substitute geometry. Authoring: `qa/build-building-closure.py` and `qa/building-closure-source.blend`.

## Rejected candidate

Street Lamp 02 by Josh Dean, https://polyhaven.com/a/street_lamp_02 , was downloaded and inspected but **not applied**. Its ornate wall-mounted design does not match the modern roadside lights in the photos. The old street lighting visuals remain.

Naver street-view screenshots are reference evidence only. No Naver photograph was embedded in these models as a facade or texture.
