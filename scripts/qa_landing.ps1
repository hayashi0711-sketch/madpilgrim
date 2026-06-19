$server = Start-Process `
  -FilePath "C:\Program Files\nodejs\node.exe" `
  -ArgumentList ".\node_modules\next\dist\bin\next", "start", "-p", "3000" `
  -WorkingDirectory "C:\Users\Haruki\Projects\MadPilgrim" `
  -RedirectStandardOutput "C:\Users\Haruki\Projects\MadPilgrim\.landing-server.out.log" `
  -RedirectStandardError "C:\Users\Haruki\Projects\MadPilgrim\.landing-server.err.log" `
  -WindowStyle Hidden `
  -PassThru

try {
  Start-Sleep -Seconds 4
  $chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
  $profile = Join-Path $env:TEMP "mad-pilgrim-chrome-qa-$PID"

  Start-Process -FilePath $chrome -ArgumentList "--headless=new", "--no-sandbox", "--no-first-run", "--disable-gpu", "--hide-scrollbars", "--virtual-time-budget=12000", "--user-data-dir=$profile", "--window-size=1440,1200", "--screenshot=C:\Users\Haruki\Projects\MadPilgrim\qa-desktop.png", "http://localhost:3000/ja#highlights" -Wait -WindowStyle Hidden
  Start-Process -FilePath $chrome -ArgumentList "--headless=new", "--no-sandbox", "--no-first-run", "--disable-gpu", "--hide-scrollbars", "--virtual-time-budget=12000", "--user-data-dir=$profile", "--window-size=390,844", "--screenshot=C:\Users\Haruki\Projects\MadPilgrim\qa-mobile.png", "http://localhost:3000/ja#highlights" -Wait -WindowStyle Hidden

  Get-Item "C:\Users\Haruki\Projects\MadPilgrim\qa-desktop.png", "C:\Users\Haruki\Projects\MadPilgrim\qa-mobile.png" |
    Select-Object Name, Length, LastWriteTime
}
finally {
  Stop-Process -Id $server.Id -ErrorAction SilentlyContinue
}
