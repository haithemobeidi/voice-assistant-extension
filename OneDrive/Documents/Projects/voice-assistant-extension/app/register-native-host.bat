@echo off
echo Installing native messaging host manifest...

REM Get the extension ID from user
set /p EXTENSION_ID="Enter your Chrome extension ID (from chrome://extensions): "

REM Update the manifest with the correct extension ID
powershell -Command "(Get-Content 'com.voiceassistant.host.json') -replace 'EXTENSION_ID_HERE', '%EXTENSION_ID%' | Set-Content 'com.voiceassistant.host.json'"

REM Get the full path to the manifest
set MANIFEST_PATH=%~dp0com.voiceassistant.host.json

REM Register in Windows Registry for Chrome
REG ADD "HKCU\Software\Google\Chrome\NativeMessagingHosts\com.voiceassistant.host" /ve /t REG_SZ /d "%MANIFEST_PATH%" /f

echo.
echo ===================================
echo Native messaging host registered!
echo Manifest path: %MANIFEST_PATH%
echo Extension ID: %EXTENSION_ID%
echo ===================================
echo.
echo Now restart Chrome for changes to take effect.
pause
