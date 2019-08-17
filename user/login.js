const ACI = require('amazon-cognito-identity-js');
global.fetch = require('node-fetch');

let cachedDb = null;

exports.handler = (event, context, callback) => {

    const poolData = {
        UserPoolId: "",
        ClientId: ""
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
            callback(null, data);
        },
        onFailure: err => {
            callback(err.message, null)
        }
    });

}