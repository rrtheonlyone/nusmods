// @flow

import path from 'path';
import bunyan from 'bunyan';
import { lightFormat } from 'date-fns';
import getSentryStream from './SentryStream';
import { errorSerializer } from './serializer';

const logRoot = path.join(__dirname, '../../../logs');

// In production, create a new log for each run
const logSuffix =
  process.env.NODE_ENV === 'production' ? lightFormat(new Date(), '-yyyy-MM-dd.HH-mm-ss') : '';

const rootLogger = bunyan.createLogger({
  name: 'scraper',

  serializers: {
    err: errorSerializer,
  },

  streams: [
    {
      stream: process.stdout,
      level: 'info',
    },
    {
      path: path.join(logRoot, `info${logSuffix}.log`),
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
    {
      path: path.join(logRoot, `errors${logSuffix}.log`),
      level: 'error',
    },
  ],
});

// Report error and above messages to Sentry
if (process.env.NODE_ENV === 'production') {
  rootLogger.addStream({
    type: 'raw',
    level: 'error',
    stream: getSentryStream({
      tags: ['service', 'task'],
      extra: ['moduleCode'],
    }),
  });
}

// Reexport Logger class to allow for easier refactoring in the future
export { Logger } from 'bunyan';
export default rootLogger;