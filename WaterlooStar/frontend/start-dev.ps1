Write-Host "Starting Student Community Forum Development Server..." -ForegroundColor Green
Write-Host ""
$env:NODE_OPTIONS = "--openssl-legacy-provider"
npm start
