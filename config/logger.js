import winston from 'winston';
import settings from '@/config/settings';

const logger = new (winston.Logger) ({
  transports: [
    new (winston.transports.Console) ({
      level: settings.logLevel
    }),
    new (winston.transports.File) ({
      level: settings.logLevel,
      filename: `${settings.env}.log`
    })
  ]
});

module.exports = logger;
