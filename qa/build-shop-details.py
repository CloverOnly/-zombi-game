"""Adapt existing CC0 mesh surfaces/profiles and the newly downloaded patio set.
No primitive box substitutes; derivation is recorded in SHOP_DETAILING.md.
"""
import bpy,bmesh,os,math,json
from mathutils import Vector
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=os.path.join(ROOT,'assets','models','exterior','right-building')
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def imported(file):
    before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=file)
    return [o for o in bpy.data.objects if o not in before and o.type=='MESH']
def bounds(objects):
    vs=[o.matrix_world@v.co for o in objects for v in o.data.vertices]
    return Vector(tuple(min(v[i] for v in vs) for i in range(3))),Vector(tuple(max(v[i] for v in vs) for i in range(3)))
def flatten(o):
    for v in o.data.vertices:v.co=o.matrix_world@v.co
    o.matrix_world.identity()
def export(objects,name):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:o.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,name+'.glb'),export_format='GLB',use_selection=True,export_animations=False,export_yup=True,export_image_format='JPEG',export_jpeg_quality=85)
    print('DETAIL_EXPORTED',name,sum(len(o.data.polygons) for o in objects))
postobjs=imported(os.path.join(ROOT,'assets','models','exterior','street-detail','modular_chainlink_fence','modular_chainlink_fence_1k.gltf'))
post=bpy.data.objects['modular_chainlink_fence_post'];lo,hi=bounds([post]);postcopy=bpy.data.objects.new('Existing_CC0_metal_profile',post.data.copy());bpy.context.collection.objects.link(postcopy)
for v in postcopy.data.vertices:
    q=post.matrix_world@v.co;v.co=((q.x-(lo.x+hi.x)/2)*.034/(hi.x-lo.x),(q.y-(lo.y+hi.y)/2)*.034/(hi.y-lo.y),(q.z-lo.z)/(hi.z-lo.z))
metal=postcopy.data.materials[0].copy();metal.name='Shop dark aluminium original normal ARM';postcopy.data.materials.clear();postcopy.data.materials.append(metal)
bs=next(n for n in metal.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
for link in list(metal.node_tree.links):
    if link.to_node==bs and link.to_socket.name=='Base Color':metal.node_tree.links.remove(link)
bs.inputs['Base Color'].default_value=(.065,.075,.081,1);bs.inputs['Metallic'].default_value=.72
bpy.context.view_layer.objects.active=postcopy;postcopy.select_set(True);mod=postcopy.modifiers.new('Small-profile reduction','DECIMATE');mod.ratio=.15;bpy.ops.object.modifier_apply(modifier=mod.name)
export([postcopy],'shop-metal-profile')
walls=imported(os.path.join(OUT,'clinic-cladding.glb'));surface=walls[0];flatten(surface);lo,hi=bounds([surface]);
cloth=bpy.data.materials.new('Adapted CC0 melange awning cloth');cloth.use_nodes=True;nodes=cloth.node_tree.nodes;links=cloth.node_tree.links;bs=nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(.29,.20,.125,1);bs.inputs['Roughness'].default_value=.87
clothroot=os.path.join(ROOT,'assets','models','hands','studio-fps')
for stem in ['nor_gl','rough']:
    im=bpy.data.images.load(os.path.join(clothroot,'jogging_melange_'+stem+'_1k.png'));im.scale(512,512);im.colorspace_settings.name='Non-Color';im.pack();tex=nodes.new('ShaderNodeTexImage');tex.image=im
    if stem=='nor_gl':
        normal=nodes.new('ShaderNodeNormalMap');normal.inputs['Strength'].default_value=.28;links.new(tex.outputs['Color'],normal.inputs['Color']);links.new(normal.outputs['Normal'],bs.inputs['Normal'])
    else:links.new(tex.outputs['Color'],bs.inputs['Roughness'])
def sheet(name,lip=False):
    obj=bpy.data.objects.new(name,surface.data.copy());bpy.context.collection.objects.link(obj)
    bm=bmesh.new();bm.from_mesh(obj.data);bmesh.ops.subdivide_edges(bm,edges=list(bm.edges),cuts=12,use_grid_fill=True);bm.to_mesh(obj.data);bm.free()
    for v in obj.data.vertices:
        q=v.co.copy();u=(q.x-lo.x)/(hi.x-lo.x);t=(q.z-lo.z)/(hi.z-lo.z);thin=(q.y-(lo.y+hi.y)/2)
        if lip:v.co=(3*(u-.5),-1.12+thin,-.34-.20*t+.022*math.cos(u*math.pi*24)*t)
        else:v.co=(3*(u-.5),-1.12*t+thin,-.34*t-.018*math.sin(math.pi*t))
    obj.data.materials.clear();obj.data.materials.append(cloth)
    bpy.context.view_layer.objects.active=obj;obj.select_set(True);mod=obj.modifiers.new('Keep awning silhouette with fewer triangles','DECIMATE');mod.ratio=.04;bpy.ops.object.modifier_apply(modifier=mod.name);obj.select_set(False)
    return obj
awning=[sheet('CC0_surface_sloped_awning'),sheet('CC0_surface_fabric_valance',True)]
for x in [-1.34,1.34]:
    obj=bpy.data.objects.new('CC0_profile_awning_support',postcopy.data.copy());bpy.context.collection.objects.link(obj)
    direction=Vector((0,-1.06,-.34));obj.rotation_mode='QUATERNION';obj.rotation_quaternion=Vector((0,0,1)).rotation_difference(direction.normalized());obj.scale.z=direction.length;obj.location=(x,0,-.03);awning.append(obj)
export(awning,'shop-awning')
patio=imported(os.path.join(OUT,'outdoor-table-source','outdoor_table_chair_set_01_1k.gltf'));lo,hi=bounds(patio)
for obj in patio:
    flatten(obj)
    for v in obj.data.vertices:v.co-=Vector(((lo.x+hi.x)/2,(lo.y+hi.y)/2,lo.z))
    for im in bpy.data.images:
        if im.filepath and not im.packed_file:im.pack()
export(patio,'shop-patio')
manifest={'canopy':'Adapted original CC0 wall surface + original fence profile; custom shaping, not a downloaded complete awning','cloth':'Poly Haven jogging_melange normal/roughness reused from prior hand work; brown color authored','patio':'Poly Haven outdoor_table_chair_set_01, James Ray Cock, new 1k source download','files':['shop-metal-profile.glb','shop-awning.glb','shop-patio.glb']}
open(os.path.join(ROOT,'qa','shop-detail-build.json'),'w',encoding='utf-8').write(json.dumps(manifest,indent=2))
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'qa','shop-detail-source.blend'))
