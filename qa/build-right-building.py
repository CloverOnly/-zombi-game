"""Edit existing downloaded CC0 models into Korean clinic/shop facade components."""
import bpy,bmesh,math,os
from mathutils import Vector
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE=os.path.join(ROOT,'assets','models','exterior')
OUT=os.path.join(BASE,'right-building');os.makedirs(OUT,exist_ok=True)
# Reuse the original modeled metal post, normalization and export helpers.
helper=open(os.path.join(ROOT,'qa','build-reference-street.py'),encoding='utf-8').read().split('bollard=post_copy')[0]
exec(compile(helper,'street-model-helpers','exec'))
OUT=os.path.join(BASE,'right-building')
steel.name='Clinic aluminium frame'
bs=next(n for n in steel.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
for link in list(steel.node_tree.links):
    if link.to_node==bs and link.to_socket.name=='Base Color':steel.node_tree.links.remove(link)
bs.inputs['Base Color'].default_value=(.55,.58,.57,1)
bs.inputs['Metallic'].default_value=.6;bs.inputs['Roughness'].default_value=.38
before=set(bpy.data.objects)
bpy.ops.import_scene.gltf(filepath=os.path.join(BASE,'street-detail','reference-edits','reference-storefront.glb'))
panes=[]
for src in [o for o in bpy.data.objects if o not in before and o.type=='MESH']:
    obj=bpy.data.objects.new('Clinic casement glazing',src.data.copy());bpy.context.collection.objects.link(obj)
    for v in obj.data.vertices:v.co=src.matrix_world@v.co
    bm=bmesh.new();bm.from_mesh(obj.data)
    remove=[f for f in bm.faces if 'glass' not in obj.data.materials[f.material_index].name.lower()]
    bmesh.ops.delete(bm,geom=remove,context='FACES');bm.to_mesh(obj.data);bm.free()
    if not obj.data.polygons:continue
    coords=[v.co for v in obj.data.vertices];lo=Vector(tuple(min(v[i] for v in coords) for i in range(3)));hi=Vector(tuple(max(v[i] for v in coords) for i in range(3)))
    for v in obj.data.vertices:
        v.co.x=(v.co.x-(lo.x+hi.x)/2)*3.60/(hi.x-lo.x);v.co.y-=((lo.y+hi.y)/2);v.co.z=(v.co.z-lo.z)*1.90/(hi.z-lo.z)+.04
    for i,original in enumerate(obj.data.materials):
        mat=original.copy();mat.name='Clinic teal glass with authored blinds';obj.data.materials[i]=mat
        bs=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
        for link in list(mat.node_tree.links):
            if link.to_node==bs and link.to_socket.name=='Base Color':mat.node_tree.links.remove(link)
        image=bpy.data.images.new('Authored clinic blind color',width=512,height=512,alpha=False)
        pixels=[]
        for y in range(512):
            slat=(y*48/512)%1;f=.86+.14*math.cos(slat*math.pi*.8)
            if slat<.12:f*=.78
            f*=.94+.06*y/511
            for x in range(512):pixels.extend((.27*f,.41*f,.43*f,1))
        image.pixels[:]=pixels;image.pack();tex=mat.node_tree.nodes.new('ShaderNodeTexImage');tex.image=image
        mat.node_tree.links.new(tex.outputs['Color'],bs.inputs['Base Color'])
        bs.inputs['Metallic'].default_value=.22;bs.inputs['Roughness'].default_value=.21;bs.inputs['Alpha'].default_value=1
        if 'Transmission Weight' in bs.inputs:bs.inputs['Transmission Weight'].default_value=0
        for node in mat.node_tree.nodes:
            if node.type=='NORMAL_MAP':node.inputs['Strength'].default_value=.10
    panes.append(obj)
for x in [-1.82,0,1.82]:
    obj=post_copy('Clinic vertical mullion',2.0,.35);obj.location=(x,-.055,0);reduce(obj,.13);panes.append(obj)
for h in [.03,.44,1.97]:
    obj=post_copy('Clinic casement transom',3.66,.30);obj.rotation_euler.y=math.pi/2;obj.location=(-1.83,-.055,h);reduce(obj,.10);panes.append(obj)
export(panes,'clinic-window')
# Stock door and cornice geometry retain the existing actual architectural details.
bpy.ops.import_scene.gltf(filepath=os.path.join(BASE,'polyhaven-facade','modular_urban_apartments_facade_1k.gltf'))
for name,out,ratio in [('cornice_standard_standard_01','clinic-cornice',.16)]:
    src=bpy.data.objects.get(name);assert src,name
    originals=[o for o in [src]+list(src.children_recursive) if o.type=='MESH'];made=[]
    coords=[o.matrix_world@v.co for o in originals for v in o.data.vertices]
    lo=Vector(tuple(min(v[i] for v in coords) for i in range(3)));hi=Vector(tuple(max(v[i] for v in coords) for i in range(3)))
    for original in originals:
        obj=bpy.data.objects.new(out,original.data.copy());bpy.context.collection.objects.link(obj)
        for v in obj.data.vertices:v.co=original.matrix_world@v.co-Vector(((lo.x+hi.x)/2,(lo.y+hi.y)/2,lo.z))
        for i,old in enumerate(obj.data.materials):
            mat=old.copy();mat.name='Clinic entry glass' if 'glass' in old.name.lower() else 'Clinic charcoal metal';obj.data.materials[i]=mat
            bs=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
            for link in list(mat.node_tree.links):
                if link.to_node==bs and link.to_socket.name=='Base Color':mat.node_tree.links.remove(link)
            bs.inputs['Base Color'].default_value=(.08,.15,.17,1) if 'glass' in old.name.lower() else (.055,.06,.065,1)
            bs.inputs['Roughness'].default_value=.25 if 'glass' in old.name.lower() else .48
        reduce(obj,ratio);made.append(obj)
    print('SOURCE_BOUNDS',out,list(hi-lo));export(made,out)
# Modern two-leaf glazed entry, edited from the actual casement model.
before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=os.path.join(OUT,'clinic-window.glb'));entry=[]
for obj in [o for o in bpy.data.objects if o not in before and o.type=='MESH']:
    for v in obj.data.vertices:v.co=obj.matrix_world@v.co;v.co.x*=1.48/3.70;v.co.z*=2.81/2
    obj.matrix_world.identity()
    for i,old in enumerate(obj.data.materials):
        mat=old.copy();obj.data.materials[i]=mat
        if 'glass' in mat.name.lower():
            mat.name='Clinic plain glazed entry';bs=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
            for link in list(mat.node_tree.links):
                if link.to_node==bs and link.to_socket.name=='Base Color':mat.node_tree.links.remove(link)
            bs.inputs['Base Color'].default_value=(.12,.20,.22,1);bs.inputs['Roughness'].default_value=.16
    entry.append(obj)
# Keep real lever/lock components from the downloaded door, removing its decorative leaf/pediment.
src=bpy.data.objects['door_centered_small_01'];originals=[o for o in [src]+list(src.children_recursive) if o.type=='MESH']
coords=[o.matrix_world@v.co for o in originals for v in o.data.vertices];lo=Vector(tuple(min(v[i] for v in coords) for i in range(3)));hi=Vector(tuple(max(v[i] for v in coords) for i in range(3)))
shift=Vector(((lo.x+hi.x)/2,(lo.y+hi.y)/2,lo.z))
for original in originals:
    obj=bpy.data.objects.new('Actual CC0 entry lever',original.data.copy());bpy.context.collection.objects.link(obj)
    bm=bmesh.new();bm.from_mesh(obj.data)
    for v in bm.verts:v.co=original.matrix_world@v.co-shift
    bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.00001)
    remaining=set(bm.verts);keep=set()
    while remaining:
        first=remaining.pop();part={first};stack=[first]
        while stack:
            for edge in stack.pop().link_edges:
                for v in edge.verts:
                    if v in remaining:remaining.remove(v);part.add(v);stack.append(v)
        mn=Vector(tuple(min(v.co[i] for v in part) for i in range(3)));mx=Vector(tuple(max(v.co[i] for v in part) for i in range(3)))
        if mn.x>.20 and mn.z>.7 and mx.z<1.4:keep.update(part)
    bmesh.ops.delete(bm,geom=[v for v in bm.verts if v not in keep],context='VERTS')
    for v in bm.verts:v.co.x-=.25;v.co.y=-abs(v.co.y)
    for f in bm.faces:f.material_index=0
    bm.to_mesh(obj.data);bm.free()
    if obj.data.polygons:
        obj.data.materials.clear();obj.data.materials.append(steel);entry.append(obj)
        other=bpy.data.objects.new('Mirrored actual CC0 lever',obj.data.copy());bpy.context.collection.objects.link(other)
        for v in other.data.vertices:v.co.x=-v.co.x
        entry.append(other)
export(entry,'clinic-entry')
# Calibrate the existing photographic wall albedo to pale stone without affecting other buildings.
before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=os.path.join(BASE,'street-detail','reference-edits','reference-building-closure.glb'))
walls=[o for o in bpy.data.objects if o not in before and o.type=='MESH']
for obj in walls:
    for i,old in enumerate(obj.data.materials):
        mat=old.copy();mat.name='Clinic pale photographic cladding';obj.data.materials[i]=mat
        bs=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED');link=next(iter(bs.inputs['Base Color'].links),None)
        if link and link.from_node.type=='TEX_IMAGE':
            node=link.from_node;original=node.image;pixels=list(original.pixels[:]);im=bpy.data.images.new('Clinic pale stone photographic albedo',width=original.size[0],height=original.size[1],alpha=False)
            for p in range(0,len(pixels),4):
                lum=.2126*pixels[p]+.7152*pixels[p+1]+.0722*pixels[p+2];pixels[p]=pixels[p+1]=pixels[p+2]=.55+.35*lum
            im.pixels[:]=pixels;im.pack();node.image=im
export(walls,'clinic-cladding')
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'qa','right-building-source.blend'))
