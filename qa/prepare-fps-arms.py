import bpy, json, math, bmesh
from pathlib import Path
from mathutils import Vector, Matrix
root=Path(__file__).resolve().parent/'fps-arms-candidates'
out=root/'para-preview'; out.mkdir(exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(root/'FPS ARMS RIG 1.blend'))
if bpy.context.object and bpy.context.object.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
rig=next(o for o in bpy.data.objects if o.type=='ARMATURE')
mesh=next(o for o in bpy.data.objects if o.type=='MESH')
for o in list(bpy.data.objects):
    if o not in (rig,mesh):bpy.data.objects.remove(o,do_unlink=True)
rig.animation_data_clear()
for action in list(bpy.data.actions):bpy.data.actions.remove(action)
# Convert the author's IK target into a continuous FK elbow -> wrist chain.
bpy.context.view_layer.objects.active=rig
bpy.ops.object.mode_set(mode='EDIT')
rig.data.edit_bones['hand.R.control'].parent=rig.data.edit_bones['forearm.R']
for b in list(rig.data.edit_bones):
    if b.name.endswith('.L') or b.name=='hand.L.control':rig.data.edit_bones.remove(b)
bpy.ops.object.mode_set(mode='OBJECT')
for p in rig.pose.bones:
    p.rotation_mode='XYZ'; p.rotation_euler=(0,0,0);p.location=(0,0,0);p.scale=(1,1,1)
    for c in list(p.constraints): p.constraints.remove(c)
mat=bpy.data.materials.new('Skin_PBR');mat.use_nodes=True
n=mat.node_tree.nodes;n.clear();links=mat.node_tree.links
output=n.new('ShaderNodeOutputMaterial');skin=n.new('ShaderNodeBsdfPrincipled');links.new(skin.outputs['BSDF'],output.inputs['Surface'])
skin.inputs['Roughness'].default_value=.63
skin.inputs['Subsurface Weight'].default_value=.055
tex=n.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(root/'new_diff.png'));links.new(tex.outputs['Color'],skin.inputs['Base Color'])
mesh.data.materials.clear();mesh.data.materials.append(mat)
# Keep the complete, original right arm (including elbow), without stretching vertices.
bm=bmesh.new();bm.from_mesh(mesh.data)
bmesh.ops.delete(bm,geom=[v for v in bm.verts if v.co.x>0],context='VERTS')
bm.to_mesh(mesh.data);bm.free()
# Original anatomical finger bones, curled into a cylindrical power grip.
for finger,angles in {'index':[.65,1.15,.85],'middle':[.65,1.45,.85],'ring':[.25,1.25,.85],'pinky':[1.55,1.65,1.25]}.items():
    for i,angle in enumerate(angles,1):rig.pose.bones[f'f_{finger}.{i:02}.R'].rotation_euler.x=angle
rig.pose.bones['thumb.01.R'].rotation_euler=(.45,-.25,-.25)
rig.pose.bones['thumb.02.R'].rotation_euler=(.60,0,0)
rig.pose.bones['thumb.03.R'].rotation_euler=(.45,0,0)
rig.pose.bones['palm_pinky.R'].rotation_euler=(.35,0,.10)
base={p.name:p.rotation_euler.copy() for p in rig.pose.bones}
bpy.context.scene.render.fps=100
clips={
 'Idle':[(0,0,0),(50,.008,.01),(100,0,0),(150,-.008,-.01),(200,0,0)],
 'Walk':[(0,0,0),(25,.022,.028),(50,0,0),(75,-.022,-.028),(100,0,0)],
 'Run':[(0,.08,-.10),(16,.11,-.05),(32,.08,-.10),(48,.05,-.15),(64,.08,-.10)],
 'Attack':[(0,0,0),(10,-.12,.32),(16,.22,-.78),(24,.30,-.90),(32,.12,-.32),(42,0,0)]
}
for name,keys in clips.items():
    action=bpy.data.actions.new(name);rig.animation_data_create();rig.animation_data.action=action
    for frame,shoulder,elbow in keys:
        for p in rig.pose.bones:p.rotation_euler=base[p.name]
        rig.pose.bones['upper_arm.R'].rotation_euler.z+=shoulder
        rig.pose.bones['forearm.R'].rotation_euler.x+=elbow
        for p in rig.pose.bones:p.keyframe_insert(data_path='rotation_euler',frame=frame+1)
    for curve in action.fcurves:
        for key in curve.keyframe_points:key.interpolation='BEZIER'
rig.animation_data.action=bpy.data.actions['Idle'];bpy.context.scene.frame_set(1)
# Procedurally authored microdetail maps; these are not source scan / high-poly bakes.
uv=n.new('ShaderNodeTexCoord');noise=n.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=380;noise.inputs['Detail'].default_value=2
links.new(uv.outputs['UV'],noise.inputs['Vector'])
bump=n.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.16;bump.inputs['Distance'].default_value=.002
links.new(noise.outputs['Fac'],bump.inputs['Height']);links.new(bump.outputs['Normal'],skin.inputs['Normal'])
roughRange=n.new('ShaderNodeMapRange');roughRange.inputs['To Min'].default_value=.52;roughRange.inputs['To Max'].default_value=.68
links.new(noise.outputs['Fac'],roughRange.inputs['Value']);links.new(roughRange.outputs['Result'],skin.inputs['Roughness'])
bpy.context.scene.render.engine='CYCLES';bpy.context.scene.cycles.samples=8
bpy.ops.object.select_all(action='DESELECT');mesh.select_set(True);bpy.context.view_layer.objects.active=mesh
for name,kind in [('skin_normal','NORMAL'),('skin_roughness','ROUGHNESS')]:
    im=bpy.data.images.new(name,width=1024,height=1024);im.colorspace_settings.name='Non-Color'
    target=n.new('ShaderNodeTexImage');target.image=im;n.active=target
    bpy.ops.object.bake(type=kind,margin=8)
    im.filepath_raw=str(out/(name+'.png'));im.file_format='PNG';im.save()
    n.remove(target)
links.remove(skin.inputs['Normal'].links[0]);normalTex=n.new('ShaderNodeTexImage');normalTex.image=bpy.data.images['skin_normal'];normal=n.new('ShaderNodeNormalMap');links.new(normalTex.outputs['Color'],normal.inputs['Color']);links.new(normal.outputs['Normal'],skin.inputs['Normal'])
roughTex=n.new('ShaderNodeTexImage');roughTex.image=bpy.data.images['skin_roughness'];links.new(roughTex.outputs['Color'],skin.inputs['Roughness'])
rig.scale=(.1,.1,.1)
bpy.ops.object.select_all(action='DESELECT');rig.select_set(True);mesh.select_set(True)
bpy.context.view_layer.objects.active=rig
bpy.ops.export_scene.gltf(filepath=str(out/'arms.gltf'),export_format='GLTF_SEPARATE',use_selection=True,export_animations=True,export_yup=True,export_extras=True)
info=[]
for p in rig.pose.bones:
    info.append({'name':p.name,'head':list(p.head),'tail':list(p.tail),'x_axis':list(p.x_axis),'y_axis':list(p.y_axis),'z_axis':list(p.z_axis),'parent':p.parent.name if p.parent else None})
(out/'axes.json').write_text(json.dumps(info,indent=2))
