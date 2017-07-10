import { MongoClient } from 'mongodb';
import Promise from 'bluebird';
import settings from '@/config/settings';
import logger from '@/config/logger';

var promise = undefined;
var conn = undefined;

export function getConnection() {
  if (!conn) { promise = undefined; }
  if (conn) {
    conn.collection('readings').find({}).toArray((err, result) => {
      if (err) { conn = undefined; promise = undefined; }
    });
  }

  if (!promise) {
    promise = new Promise((resolve, reject) => {
      MongoClient.connect(
        settings.mongoUrl,
        {
          promiseLibrary: Promise
        },
        (err, connection) => {
          if (err) {
            promise = 'undefined';
            reject(err);
          } else {
            logger.info("Connected to database");
            conn = connection;
            resolve(connection);
          }
        }
      );
    });
  }
  return promise;

};
