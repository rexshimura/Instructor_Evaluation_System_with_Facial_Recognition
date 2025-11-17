const awsexports = {
    "aws_project_region": "us-east-1",
    "aws_cognito_identity_pool_id": "us-east-1:de5ebbd3-edd3-4f37-8ed4-73ad80b98898",
    // We only need the Identity Pool for Face Liveness, so we stick to Auth config
    "Auth": {
        "region": "us-east-1",
        "identityPoolId": "us-east-1:de5ebbd3-edd3-4f37-8ed4-73ad80b98898",
    }
};

export default awsexports;