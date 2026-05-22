# AWS Elastic Beanstalk launch script
$ErrorActionPreference = "Stop"

$AppName = "TeamTaskManager"
$EnvName = "TeamTaskManager-env"
$S3Bucket = "vijay9021891022-2005"
$S3Key = "deployment.zip"
$SolutionStack = "64bit Amazon Linux 2023 v6.11.0 running Node.js 20"
$VersionLabel = "v" + (Get-Date -Format "yyyyMMddHHmmss")

Write-Host "Creating application..."
aws elasticbeanstalk create-application --application-name $AppName --description "MERN Team Task Manager"

Write-Host "Creating application version..."
aws elasticbeanstalk create-application-version --application-name $AppName --version-label $VersionLabel --source-bundle S3Bucket=$S3Bucket,S3Key=$S3Key --auto-create-application

Write-Host "Creating environment (this may take a few seconds to start)..."
aws elasticbeanstalk create-environment `
    --application-name $AppName `
    --environment-name $EnvName `
    --solution-stack-name $SolutionStack `
    --version-label $VersionLabel `
    --option-settings `
        "Namespace=aws:autoscaling:launchconfiguration,OptionName=IamInstanceProfile,Value=aws-elasticbeanstalk-ec2-role" `
        "Namespace=aws:elasticbeanstalk:environment,OptionName=ServiceRole,Value=aws-elasticbeanstalk-service-role" `
        "Namespace=aws:elasticbeanstalk:application:environment,OptionName=NODE_ENV,Value=production" `
        "Namespace=aws:elasticbeanstalk:application:environment,OptionName=PORT,Value=8080" `
        "Namespace=aws:elasticbeanstalk:application:environment,OptionName=MONGO_URI,Value=REPLACE_WITH_YOUR_MONGO_ATLAS_URI" `
        "Namespace=aws:elasticbeanstalk:application:environment,OptionName=JWT_SECRET,Value=TeamTaskManagerSuperSecureKey2026" `
        "Namespace=aws:elasticbeanstalk:application:environment,OptionName=CLIENT_URL,Value=*"

Write-Host "Deployment initiated successfully!"
