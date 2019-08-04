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
    console.log('thsis is hero ==>', db);
  
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

    const { email, password, code } = event;

    connectToDatabase(MONGODB_URI)
        .then((db) => { 
            queryDatabase(db, event)
                .then(result => {
                    if (result && result.length > 0) {
                        if (email) {
                            const userDetails = {
                                Username: email,
                                Pool: userPool
                            };
                    
                            const cognitoUser = new ACI.CognitoUser(userDetails);
                    
                            cognitoUser.forgotPassword({
                                onSuccess: data => {
                                    callback(null, { messsage: 'Email Sent'} );
                                },
                                onFailure: err => {
                                    callback({ error: err.message }, null);
                                }
                            });
                        } else {
                            const userDetails = {
                                Username: result[0].email,
                                Pool: userPool
                            };
                    
                            const cognitoUser = new ACI.CognitoUser(userDetails);
                            cognitoUser.confirmPassword(code, password, {
                                onSuccess: data => {
                                    callback(null, { message: 'Password is reset.'} );
                                },
                                onFailure: err => {
                                    callback({ error: err.message }, null);
                                }
                            });
                        }
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