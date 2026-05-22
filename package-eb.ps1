# Build and package script for AWS Elastic Beanstalk deployment
$ErrorActionPreference = "Stop"

# 1. Clean previous runs
Write-Host "Cleaning up previous builds..."
Remove-Item -Path "deployment.zip" -ErrorAction SilentlyContinue
Remove-Item -Path "temp_eb" -Recurse -Force -ErrorAction SilentlyContinue

# 2. Build the client app
Write-Host "Building React client..."
Set-Location -Path "client"
& npm install
& npm run build
Set-Location -Path ".."

# 3. Create temp directory structure
Write-Host "Creating temporary packaging structure..."
New-Item -ItemType Directory -Force -Path "temp_eb"
New-Item -ItemType Directory -Force -Path "temp_eb/client"

# 4. Copy required files and folders
Write-Host "Copying config files..."
Copy-Item -Path "package.json" -Destination "temp_eb/package.json"
Set-Content -Path "temp_eb/Procfile" -Value "web: node server/server.js"

Write-Host "Copying server directory..."
Copy-Item -Path "server" -Destination "temp_eb/server" -Recurse
# Remove node_modules from temp server to keep zip small
Remove-Item -Path "temp_eb/server/node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "temp_eb/server/.env" -Force -ErrorAction SilentlyContinue

Write-Host "Copying client build..."
Copy-Item -Path "client/dist" -Destination "temp_eb/client/dist" -Recurse

# 5. Compress into ZIP
python -c "import zipfile, os; zipf = zipfile.ZipFile('deployment.zip', 'w', zipfile.ZIP_DEFLATED); [zipf.write(os.path.join(root, file), os.path.relpath(os.path.join(root, file), 'temp_eb').replace(os.sep, '/')) for root, dirs, files in os.walk('temp_eb') for file in files]; zipf.close()"

# 6. Cleanup
Write-Host "Cleaning up temporary directory..."
Remove-Item -Path "temp_eb" -Recurse -Force

Write-Host "Successfully packaged project into deployment.zip!"
