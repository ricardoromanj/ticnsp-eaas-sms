import express from 'express';
import request from 'request';
import xml from 'xml';
import moment from 'moment';

import settings from '@/config/settings';
import logger from '@/config/logger';

const DATEOPTS = [
  'today',
  'tomorrow',
  'yesterday'
];

var router = express.Router();

router.get('/replyLiturgy', (req, res) => {
  var reqOpts = req.query;
  var errDate = false;
  var reqDate = '';
  var smsResponse = '';
  var msgBody = String(reqOpts.body);
  let momentCurDate = moment().utcOffset(settings.utcOffset);

  // Set up the response
  res.set('Content-Type', 'text/xml');
  res.status(200);

  // Debug
  logger.debug('Parameters of request: ' + JSON.stringify(reqOpts));
  logger.debug('Requested date: ' + msgBody);

  // Process the sms message and get the requested date
  if ( msgBody.match(/today/i) ) {
    reqDate = momentCurDate.format('YYYYMMDD');
  } else if ( msgBody.match(/tomorrow/i) ) {
    reqDate = momentCurDate.add(1, 'days').format('YYYYMMDD');
  } else if ( msgBody.match(/yesterday/i) ) {
    reqDate = momentCurDate.subtract(1, 'days').format('YYYYMMDD');
  } else if ( msgBody.match(/\d\d\d\d\d\d\d\d/) ) {
    // Check if date can be parsed
    if (moment(msgBody).isValid()) {
      reqDate = moment(msgBody).format('YYYYMMDD');
    } else {
      smsResmpose = 'Invalid date format.';
      errDate = true;
    }
  } else {
    smsResponse = 'Invalid option entered.';
    errDate = true;
  }

  if (errDate) {
    res.send(xml({
      "Response": [{
        "Sms": smsResponse
      }]
    }));
  } else {
    logger.debug('Requested date: ' + reqDate);
    request.get(`${settings.liturgicEndpoint}?date=${reqDate}`, function(err, httpResponse, body) {
      var liturgy = JSON.parse(body).data.content;
      logger.debug('Liturgy: ' + JSON.stringify(liturgy));

      // Go through response and collect what is needed.
      smsResponse = smsResponse.concat(`${liturgy['fr']['st']}`);
      smsResponse = smsResponse.concat('\n' + liturgy['ps']['st']);
      if ('sr' in liturgy) { smsResponse = smsResponse.concat('\n' + liturgy['sr']['st']); }
      smsResponse = smsResponse.concat('\n' + liturgy['gsp']['st']);

      logger.debug('smsResponse: ' + smsResponse);

      // Send response back
      res.send(xml({
        "Response": [{
          "Sms": smsResponse
        }]
      }));
    });
  }

});

module.exports = router;
