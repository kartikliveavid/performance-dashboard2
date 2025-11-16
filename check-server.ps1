# Server Troubleshooting Script
Write-Host "=== Checking Server Status ===" -ForegroundColor Cyan

# Check if port 3000 is in use
Write-Host "`n1. Checking if port 3000 is available..." -ForegroundColor Yellow
$port3000 = netstat -ano | findstr ":3000"
if ($port3000) {
    Write-Host "   Port 3000 is in use:" -ForegroundColor Green
    Write-Host $port3000
} else {
    Write-Host "   Port 3000 is NOT in use (server not running)" -ForegroundColor Red
}

# Check Node processes
Write-Host "`n2. Checking Node.js processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process | Where-Object {$_.ProcessName -like "*node*"}
if ($nodeProcesses) {
    Write-Host "   Node processes found:" -ForegroundColor Green
    $nodeProcesses | Format-Table ProcessName, Id, CPU -AutoSize
} else {
    Write-Host "   No Node processes running" -ForegroundColor Red
}

# Test connection
Write-Host "`n3. Testing connection to localhost:3000..." -ForegroundColor Yellow
try {
    $test = Test-NetConnection -ComputerName localhost -Port 3000 -WarningAction SilentlyContinue
    if ($test.TcpTestSucceeded) {
        Write-Host "   Connection successful!" -ForegroundColor Green
    } else {
        Write-Host "   Connection FAILED - Server is not running" -ForegroundColor Red
    }
} catch {
    Write-Host "   Connection test failed: $_" -ForegroundColor Red
}

# Check Windows Firewall
Write-Host "`n4. Checking Windows Firewall rules for port 3000..." -ForegroundColor Yellow
$firewallRules = Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*3000*" -or $_.DisplayName -like "*Node*" -or $_.DisplayName -like "*Vite*"}
if ($firewallRules) {
    Write-Host "   Found firewall rules:" -ForegroundColor Green
    $firewallRules | Format-Table DisplayName, Enabled, Direction -AutoSize
} else {
    Write-Host "   No specific firewall rules found for port 3000" -ForegroundColor Yellow
    Write-Host "   (This is usually fine for localhost connections)" -ForegroundColor Gray
}

Write-Host "`n=== Troubleshooting Steps ===" -ForegroundColor Cyan
Write-Host "1. Make sure you're running: npm run dev" -ForegroundColor White
Write-Host "2. Check the terminal for error messages" -ForegroundColor White
Write-Host "3. Try accessing: http://127.0.0.1:3000 instead of localhost:3000" -ForegroundColor White
Write-Host "4. Check if antivirus is blocking Node.js" -ForegroundColor White
Write-Host "5. Try running as Administrator if needed" -ForegroundColor White





