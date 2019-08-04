const ACI = require('amazon-cognito-identity-js');
global.fetch = require('node-fetch');

let cachedDb = null;

exports.handler = (event, context, callback) => {

    const poolData = {
        UserPoolId: "us-east-1_NcPvQduuK",
        ClientId: "l2ke85lgkglh55fn1lansjltb"
    };

    const userPool = new ACI.CognitoUserPool(poolData);

    const { email, password } = event;
    
    const loginDetails = {
        Username: email,
        Password: password
    };
    const authDetails = new ACI.AuthenticationDetails(loginDetails);
    const userDetails = {
        Username: email,
        Pool: userPool
    };
    const cognitoUser = new ACI.CognitoUser(userDetails);
    cognitoUser.authenticateUser(authDetails, {
        onSuccess: data => {
            console.log("Data ==>", data)
            callback(null, data);
        },
        onFailure: err => {
            callback(err.message, null)
        }
    });
    
}