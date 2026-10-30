# Right-side clinic/shop facade components — 2026-10-30

These GLBs are edited derivatives of the existing downloaded **CC0** assets below. Commercial use, modification and redistribution are permitted: https://polyhaven.com/license . No login or paid asset was used. This pass reuses already downloaded sources; it does not claim to have downloaded a complete Korean clinic building.

- **Modular Urban Apartments Facade**, James Ray Cock: https://polyhaven.com/a/modular_urban_apartments_facade . Original files remain in `../polyhaven-facade/`.
- **Modular Chainlink Fence**, James Ray Cock, wire material by Amal Kumar: https://polyhaven.com/a/modular_chainlink_fence . Actual modeled post geometry is used for thin frame profiles; the wire is not used. Original files remain in `../street-detail/modular_chainlink_fence/`.

## Runtime files

- `clinic-window.glb`: an actual glazing island from the facade kit, plus adapted real metal profile meshes. Includes original source normal/roughness data. The teal closed-blind color image is **authored**, not a newly downloaded photograph or copied street-view texture.
- `clinic-entry.glb`: a two-leaf glass entry adapted from that real glazing/frame mesh, with actual lever/lock geometry extracted from `door_centered_small_01`. Decorative paneling/pediment was removed. This is a static visual model, not a new interactive hospital door.
- `clinic-cornice.glb`: normalized/optimized existing cornice profile, used for roof coping and a shallow entry canopy.
- `clinic-cladding.glb`: actual facade wall geometry reused through the earlier closure-panel derivative. The photographic albedo was neutralized and brightened for pale stone; original normal/roughness data remains. This is a material adaptation, not a newly scanned stone wall.

Textures are embedded in the GLBs. There are no runtime external API calls. No new BoxGeometry/CylinderGeometry substitute building or prop is created by the new installer.

`qa/build-right-building.py` records editing and export. `qa/right-building-source.blend` is the editable source. Sign textures are authored from the visible reference text; no Naver photograph is embedded into a facade.

2026-10-30 location correction: the same GLBs are reused on the verified pedestrian-facing restaurant facade. Parking-side metal corrugation uses an authored DataTexture normal map; it is not a newly downloaded scanned material. Naver screenshots in `qa/` are reference evidence only and are not CC0 game textures.

2026-10-30 storefront pass: the same cornice GLB also supplies four shallow shop canopy sections. Bomunsan and Myeongryun lettering and simplified sign motifs are authored from visible reference text; they are not downloaded official logo artwork. No additional model download is claimed. See `VERIFIED_SHOPFRONTS.md` for the observed order and validation limits.
