@echo off
chcp 65001 >nul
title SeaReport Translator - 启动中...

echo ====================================
echo   SeaReport Translator 启动中
echo ====================================
echo.

cd /d "%~dp0"

echo [1/2] 检查环境...
if not exist node_modules (
    echo 首次运行，正在安装依赖...
    npm install --legacy-peer-deps --ignore-scripts
    echo 依赖安装完成
)

echo [2/2] 启动开发服务器...
echo.
echo    访问地址: http://localhost:3000
echo    停止服务: 按 Ctrl+C
echo.

npm run dev
pause