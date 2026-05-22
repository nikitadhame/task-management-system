# AWS Elastic Beanstalk deployment automation script
$ErrorActionPreference = "Continue" # Allow manual exit code checking
$env:AWS_DEFAULT_REGION = "us-east-1"
$env:AWS_REGION = "us-east-1"

# Configuration
$AppName = "TeamTaskManager"
$EnvName = "TeamTaskManager-env"
$S3Bucket = "vijay9021891022-2005"
$S3Key = "deployment.zip"
$SolutionStack = "64bit Amazon Linux 2023 v6.11.0 running Node.js 20"
$VersionLabel = "v" + (Get-Date -Format "yyyyMMddHHmmss")

Write-Host "Starting Elastic Beanstalk setup and deployment..."

# 1. Check/Create IAM Service Role for Elastic Beanstalk
$ServiceRoleName = "aws-elasticbeanstalk-service-role"
Write-Host "Checking IAM Service Role: $ServiceRoleName..."
$null = aws iam get-role --role-name $ServiceRoleName 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "Service role already exists."
} else {
    Write-Host "Creating IAM Service Role..."
    $trustPolicy = '{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "Service": "elasticbeanstalk.amazonaws.com"
                },
                "Action": "sts:AssumeRole",
                "Condition": {
                    "StringEquals": {
                        "sts:ExternalId": "elasticbeanstalk"
                    }
                }
            }
        ]
    }'
    Set-Content -Path "service-trust.json" -Value $trustPolicy
    $null = aws iam create-role --role-name $ServiceRoleName --assume-role-policy-document file://service-trust.json 2>&1
    Remove-Item "service-trust.json" -Force

    Write-Host "Attaching policies to Service Role..."
    $null = aws iam attach-role-policy --role-name $ServiceRoleName --policy-arn "arn:aws:iam::aws:policy/service-role/AWSElasticBeanstalkEnhancedHealth" 2>&1
    $null = aws iam attach-role-policy --role-name $ServiceRoleName --policy-arn "arn:aws:iam::aws:policy/service-role/AWSElasticBeanstalkManagedUpdatesCustomerRolePolicy" 2>&1
    Write-Host "Service role created and configured."
}

# 2. Check/Create IAM EC2 Instance Profile and Role
$InstanceRoleName = "aws-elasticbeanstalk-ec2-role"
Write-Host "Checking IAM EC2 Instance Profile: $InstanceRoleName..."
$null = aws iam get-instance-profile --instance-profile-name $InstanceRoleName 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "Instance profile already exists."
} else {
    Write-Host "Creating IAM EC2 Instance Role..."
    $trustPolicy = '{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "Service": "ec2.amazonaws.com"
                },
                "Action": "sts:AssumeRole"
            }
        ]
    }'
    Set-Content -Path "ec2-trust.json" -Value $trustPolicy
    $null = aws iam create-role --role-name $InstanceRoleName --assume-role-policy-document file://ec2-trust.json 2>&1
    Remove-Item "ec2-trust.json" -Force

    Write-Host "Attaching policies to EC2 Role..."
    $null = aws iam attach-role-policy --role-name $InstanceRoleName --policy-arn "arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier" 2>&1
    $null = aws iam attach-role-policy --role-name $InstanceRoleName --policy-arn "arn:aws:iam::aws:policy/AWSElasticBeanstalkWorkerTier" 2>&1
    $null = aws iam attach-role-policy --role-name $InstanceRoleName --policy-arn "arn:aws:iam::aws:policy/AWSElasticBeanstalkMulticontainerDocker" 2>&1

    Write-Host "Creating Instance Profile..."
    $null = aws iam create-instance-profile --instance-profile-name $InstanceRoleName 2>&1
    
    Write-Host "Waiting for IAM consistency..."
    Start-Sleep -Seconds 10

    Write-Host "Linking Role to Instance Profile..."
    $null = aws iam add-role-to-instance-profile --instance-profile-name $InstanceRoleName --role-name $InstanceRoleName 2>&1
    Write-Host "Instance profile created and configured."
}

# 3. Create Beanstalk Application if it doesn't exist
Write-Host "Checking Elastic Beanstalk Application..."
$appCheck = aws elasticbeanstalk describe-applications --application-names $AppName --output json | ConvertFrom-Json
$appExists = $appCheck.Applications.Count -gt 0

if (-not $appExists) {
    Write-Host "Creating Elastic Beanstalk Application: $AppName..."
    $null = aws elasticbeanstalk create-application --application-name $AppName --description "MERN Team Task Manager" 2>&1
} else {
    Write-Host "Application already exists."
}

# 4. Create Application Version
Write-Host "Creating Application Version: $VersionLabel..."
$null = aws elasticbeanstalk create-application-version --application-name $AppName --version-label $VersionLabel --source-bundle S3Bucket=$S3Bucket,S3Key=$S3Key --auto-create-application 2>&1

# 5. Check if environment exists to create or update
Write-Host "Checking environment status..."
$envCheck = aws elasticbeanstalk describe-environments --application-name $AppName --environment-names $EnvName --output json | ConvertFrom-Json
$envExists = $envCheck.Environments.Count -gt 0

if ($envExists) {
    Write-Host "Environment exists. Updating to version $VersionLabel..."
    $null = aws elasticbeanstalk update-environment --environment-name $EnvName --version-label $VersionLabel 2>&1
} else {
    Write-Host "Creating new environment: $EnvName..."
    $null = aws elasticbeanstalk create-environment `
        --application-name $AppName `
        --environment-name $EnvName `
        --solution-stack-name $SolutionStack `
        --version-label $VersionLabel `
        --option-settings `
            "Namespace=aws:autoscaling:launchconfiguration,OptionName=IamInstanceProfile,Value=$InstanceRoleName" `
            "Namespace=aws:elasticbeanstalk:environment,OptionName=ServiceRole,Value=$ServiceRoleName" `
            "Namespace=aws:elasticbeanstalk:application:environment,OptionName=NODE_ENV,Value=production" `
            "Namespace=aws:elasticbeanstalk:application:environment,OptionName=PORT,Value=8080" `
            "Namespace=aws:elasticbeanstalk:application:environment,OptionName=MONGO_URI,Value=REPLACE_WITH_YOUR_MONGO_ATLAS_URI" `
            "Namespace=aws:elasticbeanstalk:application:environment,OptionName=JWT_SECRET,Value=TeamTaskManagerSuperSecureKey2026" `
            "Namespace=aws:elasticbeanstalk:application:environment,OptionName=CLIENT_URL,Value=*" 2>&1
}

Write-Host "Environment creation/update initiated!"
Write-Host "It takes about 3-5 minutes for AWS to provision and deploy the EC2 servers."
Write-Host "You can monitor the progress in the AWS Elastic Beanstalk Console."
