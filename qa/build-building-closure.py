"""A reusable opaque architectural panel edited from the existing CC0 facade model."""
import bpy,os
from mathutils import Vector
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE=os.path.join(ROOT,'assets','models','exterior')
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=os.path.join(BASE,'polyhaven-facade','modular_urban_apartments_facade_1k.gltf'))
source=bpy.data.objects['wall_standard_standard_01']
parts=[o for o in [source]+list(source.children_recursive) if o.type=='MESH']
coords=[o.matrix_world@v.co for o in parts for v in o.data.vertices]
lo=Vector(tuple(min(v[i] for v in coords) for i in range(3)));hi=Vector(tuple(max(v[i] for v in coords) for i in range(3)))
made=[]
for original in parts:
    obj=bpy.data.objects.new('CC0_facade_closure_panel',original.data.copy());bpy.context.collection.objects.link(obj)
    for v in obj.data.vertices:
        v.co=original.matrix_world@v.co;v.co-=Vector(((lo.x+hi.x)/2,(lo.y+hi.y)/2,lo.z))
    bpy.ops.object.select_all(action='DESELECT');obj.select_set(True);bpy.context.view_layer.objects.active=obj
    dec=obj.modifiers.new('Planar panel optimization','DECIMATE');dec.ratio=.02;bpy.ops.object.modifier_apply(modifier=dec.name)
    for i,original_mat in enumerate(obj.data.materials):
        mat=original_mat.copy();mat.name='Neutral CC0 facade lining';obj.data.materials[i]=mat;mat.use_backface_culling=False
        for node in mat.node_tree.nodes:
            if node.type=='TEX_IMAGE' and node.image and '_diff' in node.image.name:
                original_image=node.image;pixels=list(original_image.pixels[:]);image=bpy.data.images.new('closure_neutral_photographic_diffuse',width=original_image.size[0],height=original_image.size[1],alpha=False)
                for k in range(0,len(pixels),4):
                    lum=.2126*pixels[k]+.7152*pixels[k+1]+.0722*pixels[k+2]
                    pixels[k]=pixels[k+1]=pixels[k+2]=lum
                image.pixels[:]=pixels;image.pack();node.image=image
    made.append(obj)
bpy.ops.object.select_all(action='DESELECT')
for obj in made:obj.select_set(True)
bpy.context.view_layer.objects.active=made[0]
if len(made)>1:bpy.ops.object.join()
OUT=os.path.join(BASE,'street-detail','reference-edits')
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,'reference-building-closure.glb'),use_selection=True,export_format='GLB',export_animations=False)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'qa','building-closure-source.blend'))
print('CLOSURE_PANEL_EXPORTED',len(bpy.context.view_layer.objects.active.data.polygons))
