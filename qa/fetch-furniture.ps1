$ErrorActionPreference = 'Stop'
$headers = @{'User-Agent'='PoyuHouseGame/1.0 (local furniture asset preparation)'}
$root = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../assets/furniture'))
$ids = @('Sofa_01','modern_coffee_table_01','dining_chair_02','dining_table','GothicBed_01')
$manifest = @()
foreach ($id in $ids) {
  $folder = Join-Path $root $id
  New-Item -ItemType Directory -Force $folder | Out-Null
  $files = Invoke-RestMethod "https://api.polyhaven.com/files/$id" -Headers $headers
  $asset = $files.gltf.'1k'.gltf
  if (!$asset) { throw "No 1K glTF for $id" }
  $asset | ConvertTo-Json -Depth 12 | Set-Content (Join-Path $folder 'source.json') -Encoding utf8
  Invoke-WebRequest $asset.url -Headers $headers -OutFile (Join-Path $folder 'model.gltf')
  foreach ($entry in $asset.include.PSObject.Properties) {
    $target = [IO.Path]::GetFullPath((Join-Path $folder $entry.Name))
    if (!$target.StartsWith($folder + [IO.Path]::DirectorySeparatorChar)) { throw 'Invalid asset path' }
    New-Item -ItemType Directory -Force ([IO.Path]::GetDirectoryName($target)) | Out-Null
    Invoke-WebRequest $entry.Value.url -Headers $headers -OutFile $target
  }
  $manifest += @{id=$id;page="https://polyhaven.com/a/$id";api="https://api.polyhaven.com/files/$id";license='CC0';resolution='1k';source=$asset.url}
  Write-Output "Downloaded $id"
}
$manifest | ConvertTo-Json -Depth 5 | Set-Content (Join-Path $root 'sources.json') -Encoding utf8
