@echo off

set /p pass=Enter password:

npm run hash %pass%

pause