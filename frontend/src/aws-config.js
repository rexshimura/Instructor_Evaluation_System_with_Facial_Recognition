import { Amplify } from 'aws-amplify';

// --- CONFIGURE AMPLIFY ---
// Configuration is executed directly to avoid issues with function wrappers
// and library internal initialization steps.
Amplify.configure({
    Auth: {
        region: 'us-east-1', // Your AWS region
        identityPoolId: 'us-east-1:de5ebbd3-edd3-4f37-8ed4-73ad80b98898', // The ID you created
    },
});