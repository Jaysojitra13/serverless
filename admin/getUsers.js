const MongoClient = require('mongodb').MongoClient;
const MONGODB_URI = "";
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


function queryDatabase (db) {
  
    return db.db('test').collection('users').find({ }).toArray()
      .then((data) => { return data })
      .catch(err => {
        return { statusCode: 500, body: 'error' };
      });
  }

exports.handler = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    connectToDatabase(MONGODB_URI)
        .then((db) => { 
            queryDatabase(db, event)
                .then(result => {
                    if (result && result.length > 0) {
                       callback(null, result);
                    } else {
                        callback(null, { message: "Users are not found"});
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