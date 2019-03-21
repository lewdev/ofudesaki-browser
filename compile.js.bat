@echo off
REM :: npm install -g google-closure-compiler
ECHO ========================================================================
ECHO  JavaScript Closure Compiler
ECHO ========================================================================
REM :: https://developers.google.com/closure/compiler/
REM :: java -jar ./closure-compiler-v20190301.jar ^
npx google-closure-compiler ^
--compilation_level ADVANCED_OPTIMIZATIONS ^
--js ./src/script.js ^
--js_output_file ./public/script.js

EXIT;