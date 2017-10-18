import fs from 'fs';

const settings = {}

/* ************************************************************************** */
/* Set up connection to the database, hostname is the only REQUIRED parameter */
/* ************************************************************************** */
var mongoUrl = '';
var mongoHost = process.env.MONGO_HOST;
if (mongoHost === '' || (typeof mongoHost === 'undefined')) {

  /* Error if no hostname for database provided
   * ************************************************************************ */
  console.log('ERROR: MONGO_HOST must be set');
  process.exit(1);
} else {

  /* Default to port 27017 if no port provided
   * ************************************************************************ */
  var mongoPort = process.env.MONGO_PORT;
  if (mongoPort === '' || (typeof mongoPort === 'undefined')) {
    mongoPort = 27017;
  }

  /* Prepare login portion of URL. If either param is missing, default to none
   * ************************************************************************ */
  var mongoUser = process.env.MONGO_USERNAME;
  var mongoPass = process.env.MONGO_PASSWORD;

  var mongoLogin = '';
  if (
    (mongoUser === '' || (typeof mongoUser === 'undefined')) ||
    (mongoPass === '' || (typeof mongoPass === 'undefined'))
  ) {
    mongoLogin = '';
  } else {
    mongoLogin = `${mongoUser}:${mongoPass}@`;
  }

  /* Build final mongo URL
   * ************************************************************************ */
  mongoUrl = `mongodb://${mongoLogin}${mongoHost}:${mongoPort}/ticnsp_eaas`; 
}

var env = process.env.APP_ENV;
if (env === '' || (typeof env === 'undefined')) {
  env = 'development';
}

var port = process.env.PORT;
if (port === '' || (typeof port === 'undefined')) {
  port = 5001;
}

var logLevel = process.env.LOG_LEVEL;
if (logLevel === '' || (typeof logLevel === 'undefined')) {
  logLevel = 'info';
}

var liturgicEndpoint = process.env.LITURGIC_ENDPOINT;
if (liturgicEndpoint === '' || (typeof liturgicEndpoint === 'undefined')) {
  liturgicEndpoint = 'http://ticnsp_eaas_srv:5000/liturgy';
}

var utcOffset = process.env.UTC_OFFSET;
if (utcOffset === '' || (typeof utcOffset === 'undefined')) {
  utcOffset = -6;
}

var numbersFile = process.env.NUMBERS_FILE;
if (numbersFile === '' || (typeof numbersFile === 'undefined')) {
  numbersFile = '/numbers.json';
}

// Load numbers file
try {
  var numbersContent = fs.readFileSync(numbersFile);
  settings.allowedNumbers = JSON.parse(numbersContent);
} catch (err) {
  console.log("Numbers file could not be loaded, loading empty array.");
  settings.allowedNumbers = [];
}

settings.env = env;
settings.port = port;
settings.mongoUrl = mongoUrl;
settings.logLevel = logLevel;
settings.liturgicEndpoint = liturgicEndpoint;
settings.utcOffset = utcOffset;

module.exports = settings;
