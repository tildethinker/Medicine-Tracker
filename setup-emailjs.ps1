# EmailJS Quick Setup Script
# Run this in PowerShell after getting your EmailJS credentials

Write-Host "🔧 EmailJS Configuration Setup" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Check if already configured
$configFile = "src\config\services.config.ts"
$content = Get-Content $configFile -Raw

if ($content -notmatch "YOUR_SERVICE_ID|YOUR_PUBLIC_KEY") {
    Write-Host "✅ EmailJS already configured!" -ForegroundColor Green
    Write-Host "`nCurrent configuration:" -ForegroundColor Yellow
    Select-String -Path $configFile -Pattern "serviceId:|publicKey:" | ForEach-Object { Write-Host $_.Line }
    exit 0
}

Write-Host "📧 Get your EmailJS credentials from: https://www.emailjs.com/`n" -ForegroundColor Yellow

# Prompt for credentials
Write-Host "Enter your EmailJS Service ID:" -ForegroundColor Green
$serviceId = Read-Host

Write-Host "`nEnter your EmailJS Template ID:" -ForegroundColor Green
$templateId = Read-Host

Write-Host "`nEnter your EmailJS Public Key:" -ForegroundColor Green
$publicKey = Read-Host

# Validate inputs
if ([string]::IsNullOrWhiteSpace($serviceId) -or 
    [string]::IsNullOrWhiteSpace($templateId) -or 
    [string]::IsNullOrWhiteSpace($publicKey)) {
    Write-Host "`n❌ Error: All fields are required!" -ForegroundColor Red
    exit 1
}

# Update config file
$newContent = $content `
    -replace "serviceId: 'service_xxxxxxx'", "serviceId: '$serviceId'" `
    -replace "templateId: 'template_xxxxxxx'", "templateId: '$templateId'" `
    -replace "publicKey: 'YOUR_PUBLIC_KEY'", "publicKey: '$publicKey'"

Set-Content -Path $configFile -Value $newContent -NoNewline

Write-Host "`n✅ Configuration saved successfully!" -ForegroundColor Green
Write-Host "`n📱 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Add a caregiver in the app (Caregivers tab)" -ForegroundColor White
Write-Host "   2. Set method to 'Email'" -ForegroundColor White
Write-Host "   3. Enter caregiver email address" -ForegroundColor White
Write-Host "   4. Create notification rules" -ForegroundColor White
Write-Host "   5. Test with 'Test Notification' button`n" -ForegroundColor White

Write-Host "🚀 Start the app with: npm start" -ForegroundColor Yellow
