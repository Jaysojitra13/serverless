const MongoClient = require('mongodb').MongoClient;
const MONGODB_URI = "mongodb+srv://jay:root@cluster0-twb0g.mongodb.net/test?retryWrites=true&w=majority";
const ACI = require('amazon-cognito-identity-js');
global.fetch = require('node-fetch');

let cachedDb = null;

function connectToDatabase (uri) {

  if (cachedDb) {
    return Promise.resolve(cachedDb);
  }

  return MongoClient.connect(uri)
    .then(db => {
      cachedDb = db;
      return cachedDb;
    });

}


function queryDatabase (db, event) {
  
    return db.db('test').collection('users').find({ email: event.email }).toArray()
      .then((data) => { return data })
      .catch(err => {
        return { statusCode: 500, body: 'error' };
      });
  }

exports.handler = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    const poolData = {
        UserPoolId: "us-east-1_NcPvQduuK",
        ClientId: "l2ke85lgkglh55fn1lansjltb"
    };

    const userPool = new ACI.CognitoUserPool(poolData);

    const { email, oldPassword, newPassword } = event;
    connectToDatabase(MONGODB_URI)
        .then((db) => { 
            queryDatabase(db, event)
                .then(result => {
            if (result && result.length > 0) {
                const userDetails = {
                    Username: result[0].userSub,
                    Pool: userPool,
                };
                const cognitoUser = new ACI.CognitoUser(userDetails);
            
                const authDetails = {
                    Username: email,
                    Password: oldPassword
                }
                const authDetails1 = new ACI.AuthenticationDetails(authDetails);
                    cognitoUser.authenticateUser(authDetails1, {
                        onSuccess: data => {
                            cognitoUser.changePassword(oldPassword, newPassword, (err, data1) => {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    callback(null, { message: "Password successfully changed."})
                                }
                            });
                        },
                        onFailure: err => {
                            callback({ message: "Please enter correct password"}, null);
                        }
                    });
            } else {
                callback(null, { message: "User not found"});
            }
    })
                .catch((err) => {
                    callback(err, null);        
                })
        }
            )
        .catch(err => {
            callback(err, null);
        });
}