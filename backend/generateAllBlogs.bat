@echo off
echo 🚀 Generating blogs for all categories...
echo.

echo 📱 Generating Technology Blog...
node addLiveBlog.js technology
echo.

echo 💼 Generating Business Blog...  
node addLiveBlog.js business
echo.

echo 🔬 Generating Science Blog...
node addLiveBlog.js science
echo.

echo ✅ All blogs generated successfully!
pause
