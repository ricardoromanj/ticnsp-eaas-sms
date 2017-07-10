const settings = {}

var env = process.env.APP_ENV;
if (env === '' || (typeof env === 'undefined')) {
  env = 'development';
}

var port = process.env.PORT;
if (port === '' || (typeof port === 'undefined')) {
  port = 5001;
}

var mongoUrl = process.env.MONGO_URL;
if (mongoUrl === '' || (typeof mongoUrl === 'undefined')) {
  mongoUrl = 'mongodb://localhost:4000/ticnsp_evangelio';
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

settings.env = env;
settings.port = port;
settings.mongoUrl = mongoUrl;
settings.logLevel = logLevel;
settings.liturgicEndpoint = liturgicEndpoint;
settings.utcOffset = utcOffset;

module.exports = settings;
