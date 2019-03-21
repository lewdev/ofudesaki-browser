@echo off
REM :: npm install -g google-closure-compiler
REM :: https://developers.google.com/closure/compiler/
ECHO ========================================================================
ECHO  JavaScript Closure Compiler
ECHO ========================================================================
npx google-closure-compiler ^
--compilation_level ADVANCED_OPTIMIZATIONS ^
--js ./src/analysis.js ^
--js_output_file ./public/analysis.js
PAUSE;
EXIT;