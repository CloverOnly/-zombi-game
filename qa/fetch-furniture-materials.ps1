$ErrorActionPreference = 'Stop'
$headers = @{'User-Agent'='PoyuHouseGame/1.0 (local furniture material preparation)'}
$root = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../assets/furniture'))
$bundle = @{}
foreach($id in @('leather_white','wood_table')){
  $files = Invoke-RestMethod "https://api.polyhaven.com/files/$id" -Headers $headers
  $maps = @{}
  foreach($channel in @('Diffuse','nor_gl','Rough')){
    $source = $files.$channel.'1k'.jpg
    if(!$source.url){throw "Missing $id $channel"}
    $file = Join-Path $root "$id-$channel.jpg"
    Invoke-WebRequest $source.url -Headers $headers -OutFile $file
    $maps[$channel] = 'data:image/jpeg;base64,'+[Convert]::ToBase64String([IO.File]::ReadAllBytes($file))
  }
  $bundle[$id]=$maps
}
$json = $bundle | ConvertTo-Json -Depth 5 -Compress
[IO.File]::WriteAllText((Join-Path $root 'materials.js'),'window.PoyuFurnitureMaterials='+$json+';',[Text.UTF8Encoding]::new($false))
Write-Output 'Packaged local 1K leather and wood PBR maps.'
