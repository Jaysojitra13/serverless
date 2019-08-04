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
  
    return db.db('test').collection('users').insert({ email: event.email, age: event.age, firstName: event.firstName, lastName: event.lastName, 
                                                        address: event.address, userSub: event.userSub, userType: "developer" })
      .then(() => { return data.ops[0] })
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

    const { email, password, confirmPassword } = event;
    
    if (password !== confirmPassword) {
        callback("Password Missmatch", null);
    }
    const emailData = {
        Name: 'email',
        value: email,
    };
    
    const emailAttr = new ACI.CognitoUserAttribute(emailData);

        userPool.signUp(email, password, [ emailAttr ], null, (err, data) => {
            if (err) {
                callback(err, null)
            } else {
                event.userSub = data.userSub;
                connectToDatabase(MONGODB_URI)
                    .then((db) => { 
                        queryDatabase(db, event)
                        .then((result) => {
                            callback(err, result);
                        })
                        .catch((err) => {
                            callback(err, null);
                        });
                    }
                        )
                        .catch(err => {
                        callback(err);
                    });
            }
            
        });
}