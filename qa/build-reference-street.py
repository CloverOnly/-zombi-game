"""Edit downloaded CC0 geometry; no primitive substitute architecture/props."""
import bpy, bmesh, math, os
from mathutils import Vector
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE=os.path.join(ROOT,'assets','models','exterior')
OUT=os.path.join(BASE,'street-detail','reference-edits')
os.makedirs(OUT,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=os.path.join(BASE,'street-detail','modular_chainlink_fence','modular_chainlink_fence_1k.gltf'))
post=bpy.data.objects.get('modular_chainlink_fence_post')
assert post and post.type=='MESH'
def normalized(source,name):
    obj=bpy.data.objects.new(name,source.data.copy());bpy.context.collection.objects.link(obj)
    for v in obj.data.vertices:v.co=source.matrix_world@v.co
    coords=[v.co for v in obj.data.vertices];lo=Vector(tuple(min(v[i] for v in coords) for i in range(3)));hi=Vector(tuple(max(v[i] for v in coords) for i in range(3)))
    for v in obj.data.vertices:v.co-=Vector(((lo.x+hi.x)/2,(lo.y+hi.y)/2,lo.z))
    return obj,hi-lo
def metal_material(source,name,tint):
    mat=source.copy();mat.name=name;nodes=mat.node_tree.nodes;bs=next(n for n in nodes if n.type=='BSDF_PRINCIPLED')
    # Preserve the original normal/ARM maps. Recolor the photographic diffuse to neutral steel.
    for node in nodes:
        if node.type=='TEX_IMAGE' and node.image and '_diff_' in node.image.name:
            image=node.image.copy();image.name=name+'_diffuse';p=list(image.pixels[:])
            for i in range(0,len(p),4):
                value=.2126*p[i]+.7152*p[i+1]+.0722*p[i+2]
                for k in range(3):p[i+k]=(0.45+value*.55)*tint[k]
            image.pixels[:]=p;image.pack();node.image=image
    bs.inputs['Metallic'].default_value=.65
    return mat
steel=metal_material(post.data.materials[0],'Reference brushed galvanized steel',(.69,.73,.76))
black=metal_material(post.data.materials[0],'Reference dark bollard',(.055,.063,.069))
reflect=steel.copy();reflect.name='Reference reflective bands';r=next(n for n in reflect.node_tree.nodes if n.type=='BSDF_PRINCIPLED');r.inputs['Roughness'].default_value=.24
def post_copy(name,height,radius_scale=1):
    obj,size=normalized(post,name)
    for v in obj.data.vertices:
        v.co.x*=radius_scale;v.co.y*=radius_scale
        # Keep cap/foot detail dimensions and compress the long middle section.
        z=v.co.z;end=.075
        v.co.z=z if z<end else height-(size.z-z) if z>size.z-end else end+(z-end)*(height-2*end)/(size.z-2*end)
    obj.data.materials.clear();obj.data.materials.append(steel)
    return obj
def reduce(obj,ratio=.45):
    bpy.context.view_layer.objects.active=obj;obj.select_set(True);mod=obj.modifiers.new('Game mesh reduction','DECIMATE');mod.ratio=ratio;bpy.ops.object.modifier_apply(modifier=mod.name);obj.select_set(False)
def export(objects,name):
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects:obj.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    if len(objects)>1:
        active=objects[0];bpy.ops.object.join();objects=[active]
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,name+'.glb'),export_format='GLB',use_selection=True,export_yup=True,export_animations=False)
    print('EXPORTED',name,sum(len(o.data.polygons) for o in objects if o.type=='MESH'))
bollard=post_copy('reference_bollard',.88,.9);bollard.data.materials.clear();bollard.data.materials.append(black);bollard.data.materials.append(reflect)
bm=bmesh.new();bm.from_mesh(bollard.data)
for z in [.62,.65,.70,.73]:bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),dist=.000001,plane_co=(0,0,z),plane_no=(0,0,1),clear_inner=False,clear_outer=False)
for f in bm.faces:
    z=f.calc_center_median().z
    if .62<z<.65 or .70<z<.73:f.material_index=1
bm.to_mesh(bollard.data);bm.free();reduce(bollard,.65)
bands=[]
for h in [.62,.72]:
    band,bs=normalized(bpy.data.objects['modular_chainlink_fence_post_bracket_03'],'reference_reflector_band')
    for v in band.data.vertices:v.co.x*=1.32;v.co.y*=1.32
    band.location.z=h;band.data.materials.clear();band.data.materials.append(reflect);reduce(band,.65);bands.append(band)
export([bollard]+bands,'reference-bollard')
parts=[]
upright=post_copy('reference_rail_post',1.36,.65);upright.location.x=-1.2;reduce(upright,.15);parts.append(upright)
for i,h in enumerate([.20,.43,.66,.89,1.12]):
    rail=post_copy('reference_horizontal_rail_'+str(i),2.4,.22);rail.rotation_euler.y=math.pi/2;rail.location=(-1.2,0,h);reduce(rail,.10);parts.append(rail)
export(parts,'reference-horizontal-railing')
# Derive a clean storefront module from the real facade window mesh.
before=set(bpy.data.objects)
bpy.ops.import_scene.gltf(filepath=os.path.join(BASE,'polyhaven-facade','modular_urban_apartments_facade_1k.gltf'))
source=bpy.data.objects.get('window_centered_large_01');assert source
meshes=[o for o in [source]+list(source.children_recursive) if o.type=='MESH']
coords=[o.matrix_world@v.co for o in meshes for v in o.data.vertices]
lo=Vector(tuple(min(v[i] for v in coords) for i in range(3)));hi=Vector(tuple(max(v[i] for v in coords) for i in range(3)))
size=hi-lo;center=(lo+hi)/2;store=[]
for src in meshes:
    obj=bpy.data.objects.new('reference_storefront_'+src.name,src.data.copy());bpy.context.collection.objects.link(obj)
    for v in obj.data.vertices:v.co=src.matrix_world@v.co
    bm=bmesh.new();bm.from_mesh(obj.data)
    glass_faces={f for f in bm.faces if 'glass' in obj.data.materials[f.material_index].name.lower()}
    islands=[]
    while glass_faces:
        seed=glass_faces.pop();island={seed};stack=[seed]
        while stack:
            for edge in stack.pop().edges:
                for linked in edge.link_faces:
                    if linked in glass_faces:glass_faces.remove(linked);island.add(linked);stack.append(linked)
        islands.append(island)
    keep=max(islands,key=lambda island:sum(f.calc_area() for f in island)) if islands else set()
    remove=[f for f in bm.faces if f not in keep]
    bmesh.ops.delete(bm,geom=remove,context='FACES');bm.to_mesh(obj.data);bm.free()
    for v in obj.data.vertices:
        v.co.x=(v.co.x-center.x)*3.65/size.x;v.co.y=(v.co.y-center.y)*.35;v.co.z=(v.co.z-lo.z)*5.25/size.z
    glass_vertices=set()
    for poly in obj.data.polygons:
        if 'glass' in obj.data.materials[poly.material_index].name.lower():glass_vertices.update(poly.vertices)
    if glass_vertices:
        gx0=min(obj.data.vertices[i].co.x for i in glass_vertices);gx1=max(obj.data.vertices[i].co.x for i in glass_vertices)
        gz0=min(obj.data.vertices[i].co.z for i in glass_vertices);gz1=max(obj.data.vertices[i].co.z for i in glass_vertices)
        for i in glass_vertices:
            v=obj.data.vertices[i];v.co.x=(v.co.x-gx0)/(gx1-gx0)*3.5-1.75;v.co.z=(v.co.z-gz0)/(gz1-gz0)*5.05+.10
    for i,mat in enumerate(obj.data.materials):
        m=mat.copy();m.name='Reference storefront '+mat.name;obj.data.materials[i]=m
        bs=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
        if 'glass' in mat.name.lower():
            for link in list(m.node_tree.links):
                if link.to_node==bs and link.to_socket.name in ['Base Color','Alpha','Transmission Weight']:m.node_tree.links.remove(link)
            bs.inputs['Base Color'].default_value=(.035,.085,.125,1);bs.inputs['Metallic'].default_value=.62;bs.inputs['Roughness'].default_value=.18;bs.inputs['Alpha'].default_value=1
            if 'Transmission Weight' in bs.inputs:bs.inputs['Transmission Weight'].default_value=0
            m.surface_render_method='DITHERED' if hasattr(m,'surface_render_method') else None
        else:
            for link in list(m.node_tree.links):
                if link.to_node==bs and link.to_socket.name=='Base Color':m.node_tree.links.remove(link)
            bs.inputs['Base Color'].default_value=(.26,.29,.31,1);bs.inputs['Metallic'].default_value=.7;bs.inputs['Roughness'].default_value=.38
    if len(obj.data.polygons):store.append(obj)
for x in [-1.80,1.80]:
    upright=post_copy('reference_storefront_mullion',5.25,.38);upright.location=(x,-.09,0);reduce(upright,.15);store.append(upright)
for i,h in enumerate([.04,1.45,2.85,4.25,5.21]):
    rail=post_copy('reference_storefront_crossrail_'+str(i),3.65,.22);rail.rotation_euler.y=math.pi/2;rail.location=(-1.825,-.09,h);reduce(rail,.12);store.append(rail)
export(store,'reference-storefront')
before=set(bpy.data.objects)
bpy.ops.import_scene.gltf(filepath=os.path.join(BASE,'street-detail','water_manhole_cover','water_manhole_cover_1k.gltf'))
manhole=[o for o in bpy.data.objects if o not in before and o.type=='MESH']
for obj in manhole:reduce(obj,.45 if 'frame' in obj.name else .15)
export(manhole,'reference-manhole')
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,'reference-street-editable.blend'))
