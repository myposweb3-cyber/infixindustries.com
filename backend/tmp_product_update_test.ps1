$token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzg1Njc1NTE2LCJleHAiOjE3ODYyODAzMTZ9.vtAnUIlh7-juA8ZfbChlAHMZGpyHuaOnfaAbThk7u2E'
$body = @{ title = 'Test Save'; slug = 'test-save'; description = 'Testing update route'; price = '19.99'; stock = '5'; category = '24'; brand = ''; is_featured = 'true'; is_best_seller = 'false' }
try {
  $r = Invoke-RestMethod -Uri 'http://localhost:4000/api/products/92' -Method Put -Headers @{ Authorization = "Bearer $token" } -Body ($body | ConvertTo-Json) -ContentType 'application/json'
  $r | ConvertTo-Json -Depth 5
} catch {
  Write-Error $_.Exception.Message
  if ($_.Exception.Response) {
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    Write-Output $reader.ReadToEnd()
  }
}
