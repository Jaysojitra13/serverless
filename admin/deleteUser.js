const MongoClient = require('mongodb').MongoClient;
const MONGODB_URI = "mongodb+srv://jay:root@cluster0-twb0g.mongodb.net/test?retryWrites=true&w=majority";
const mongoose = require('mongoose');
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


function queryDatabase (db, id) {

    return db.db('test').collection('users').find({ _id: mongoose.Types.ObjectId(id)}).toArray()
      .then((data) => { return data })
      .catch(err => {
        return { statusCode: 500, body: 'error' };
      });
  }

function updateDatabase (db, id) {

return db.db('test').collection('users').remove({ _id: mongoose.Types.ObjectId(id) })
    .then((data) => { return data })
    .catch(err => {
    return { statusCode: 500, body: 'error' };
    });
}

exports.handler = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    const { id } = event;

    connectToDatabase(MONGODB_URI)
        .then((db) => {
            queryDatabase(db, id)
                .then(result => {
                    if (result && result.length > 0) {
                        updateDatabase(db, id)
                            .then((resut) => {
                                callback(null, { message: "User Deleted Successfuly."});
                            })
                            .catch((err) => {
                                callback(err, null);
                            })
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