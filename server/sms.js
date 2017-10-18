import express from 'express';
import request from 'request';
import xml from 'xml';
import twilio from 'twilio';
import moment from 'moment';
import lodash from 'lodash';

import settings from '@/config/settings';
import logger from '@/config/logger';

const DATEOPTS = [
  'today',
  'tomorrow',
  'yesterday'
];

const ALWDNUMS = settings.allowedNumbers;

var router = express.Router();

router.get('/replyLiturgy', (req, res) => {
  var reqOpts = req.query;
  var msgTo = String(reqOpts.To);
  var msgBody = String(reqOpts.Body);
  var msgFrom = String(reqOpts.From);

  // Set up the response
  res.set('Content-Type', 'text/xml');

  // Debug
  logger.debug('Parameters of request: ' + JSON.stringify(reqOpts));
  logger.debug('Request date: ' + msgBody);
  logger.debug('Request from: ' + msgFrom);
  logger.debug('Request to:   ' + msgTo);

  // Check if number is in list
  if (checkNumber(msgFrom)) {
    res.status(200);

    // Set parameters
    let reqParams = setParms(msgBody, msgTo);

    // If there were date errors
    if (reqParams.dateErr) {
      logger.error("Error: Invalid date format");
      res.send(genTwiml('Error: Invalid date format'));
    }

    // If there were parameter errors
    if (reqParams.parmErr) {
      logger.error("Error: Invalid parameters");
      res.send(genTwiml('Error: Invalid parameters'));
    }

    // Request liturgy
    request.get(`${settings.liturgicEndpoint}?date=${reqParams.reqDate}&lang=${reqParams.reqLang}`, function(err, httpResponse, body) {
      let litData = JSON.parse(body).data;
      if (typeof(litData) === 'string') {
        // If there was an error, send that error back
        res.send(genTwiml('Error: ' + litData));
      } else {
        // Finally, a successful response
        let successfulResponse = genResponse(litData);
        logger.info("Success: " + successfulResponse);

        res.send(genTwiml(successfulResponse));
      }
    });
  } else {
    // Make sure Twilio does not send message
    logger.error("Error: Number not allowed - " + msgFrom);
    res.status(500);
    res.send(xml({
      "Response": []
    }));
  }

});


function checkNumber(msgFrom) {
  var index = lodash.indexOf(ALWDNUMS, msgFrom);  
  return (index >= 0);
}

function setLangFromNum(msgTo) {
  var reqLang = '';
  if (msgTo.match(/656/)) {
    reqLang = 'SP';
  } else {
    reqLang = 'AM';
  }
  return reqLang;
}

function setParms(msgBody, msgTo) {
  let reqDate = '';
  let reqLang = '';
  let dateErr = false;
  let parmErr = false;
  let params = {};
  let momentCurDate = moment().utcOffset(settings.utcOffset);

  if ( msgBody.match(/today/i) ) {
    reqDate = momentCurDate.format('YYYYMMDD');
    reqLang = 'AM';
  } else if ( msgBody.match(/hoy/i) ) {
    reqDate = momentCurDate.format('YYYYMMDD');
    reqLang = 'SP';
  } else if ( msgBody.match(/tomorrow/i) ) {
    reqDate = momentCurDate.add(1, 'days').format('YYYYMMDD');
    reqLang = 'AM';
  } else if ( msgBody.match(/ma.ana/i) ) {
    reqDate = momentCurDate.add(1, 'days').format('YYYYMMDD');
    reqLang = 'SP';
  } else if ( msgBody.match(/yesterday/i) ) {
    reqDate = momentCurDate.subtract(1, 'days').format('YYYYMMDD');
    reqLang = 'AM';
  } else if ( msgBody.match(/ayer/i) ) {
    reqDate = momentCurDate.subtract(1, 'days').format('YYYYMMDD');
    reqLang = 'SP';
  } else if ( msgBody.match(/\d\d\d\d\d\d\d\d/) ) {
    // Check if date can be parsed
    if (moment(msgBody).isValid()) {
      reqDate = moment(msgBody).format('YYYYMMDD');
      reqLang = setLangFromNum(msgTo);
    } else {
      dateErr = true;
    }
  } else {
    parmErr = true;
  }

  params.reqDate = reqDate;
  params.reqLang = reqLang;
  params.dateErr = dateErr;
  params.parmErr = parmErr;

  // Debug
  logger.debug("Request parameters: " + JSON.stringify(params));

  return params;
}

function genTwiml(resMsg) {
  let  mr = twilio.twiml.MessagingResponse;
  let res = new mr();
  let strRes = resMsg + '\nTICNSP';
  res.message(strRes);
  return res.toString();
}

function genResponse(litData) {
  let liturgy = litData.content;
  let smsResponse = '';

  // Go through response and collect what is needed.
  if (typeof(liturgy['fr']['st']) === 'undefined') {
    smsResponse = 'Date is too far away';
  } else {
    smsResponse = smsResponse.concat(`${liturgy['fr']['st']}`);
    smsResponse = smsResponse.concat('\n' + liturgy['ps']['st']);
    if ('sr' in liturgy) { smsResponse = smsResponse.concat('\n' + liturgy['sr']['st']); }
    smsResponse = smsResponse.concat('\n' + liturgy['gsp']['st']);

    // Debug
    logger.debug('smsResponse: ' + smsResponse);

    // Parse to twiml
    return smsResponse
  }
}

module.exports = router;
