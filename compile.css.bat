@echo off
ECHO ========================================================================
ECHO  cleancss
ECHO ========================================================================
REM :: npm install clean-css-cli -g
REM :: xcopy ./src/style.css ./public/style.css
cleancss -o ./public/style.css ./src/style.css .

PAUSE;
EXIT;