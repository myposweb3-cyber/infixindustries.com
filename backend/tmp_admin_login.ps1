$body = @{ email = 'admin@infix.local'; password = 'admin123' } | ConvertTo-Json
try {
  $r = Invoke-RestMethod -Uri 'http://localhost:4000/api/auth/login' -Method Post -Body $body -ContentType 'application/json'
  Write-Output $r.token
} catch {
  Write-Error $_.Exception.Message
  if ($_.Exception.Response) {
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    Write-Output $reader.ReadToEnd()
  }
}
