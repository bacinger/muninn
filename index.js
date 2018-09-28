'use strict';
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

exports.handler = function(event, context, callback) {
    let host;
    let source;
    let url;
    let ua;
    let width;
    let height;
    let response;
    let ts = Math.floor(new Date().getTime());
    let responseCode = 200;
    console.log('request: ' + JSON.stringify(event));
    
    // We use proxy to store host
    if (event.pathParameters !== null && event.pathParameters !== undefined) {
        if (event.pathParameters.proxy !== undefined && 
            event.pathParameters.proxy !== null && 
            event.pathParameters.proxy !== '') {
            host = event.pathParameters.proxy;
        }
    }

    if (event.body !== null && event.body !== undefined) {
        // POST
        let body = JSON.parse(event.body);
        if (body.source) 
            source = body.source;
        if (body.url)
            url = body.url;
        if (body.ua)
            ua = body.ua;
        if (body.width)
            width = body.width;
        if (body.height)
            height = body.height;

        let item;
        if (source) {
            item = {
                'id': {'N': generateRowId(4).toString()},
                'date': {'S': ts.toString()},
                'host': {'S': host},
                'source': {'S': source},
                'url': {'S': url},
                'ua': {'S': ua},
                'width': {'S': width.toString()},
                'height': {'S': height.toString()},
            };   
        }
        else {
            item = {
                'id': {'N': generateRowId(4).toString()},
                'date': {'S': ts.toString()},
                'host': {'S': host},
                'source': {'S': 'noscript'}
            };
        }
        saveToDynamodb(item);
        var responseBody = {
            error: false
        };
        response = {
            statusCode: responseCode,
            body: JSON.stringify(responseBody)
        };
    }
    else {
        // GET
        let item = {
            'id': {'N': generateRowId(4).toString()},
            'date': {'S': ts.toString()},
            'host': {'S': host},
            'source': {'S': 'noscript'}
        };
        saveToDynamodb(item); 
        var content = '<img src="https://svemir.co/space-pig.png" alt="">';
        response = {
            'statusCode': 200,
            'body': content,
            'headers': {
                'Content-Type': 'text/html',
            }
        };
    }
    
    console.log('response: ' + JSON.stringify(response));
    callback(null, response);
};

// https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/SQLtoNoSQL.WriteData.html
function saveToDynamodb(item) {
    console.log('dynamodb: ' + JSON.stringify(item));
    dynamodb.putItem({
        TableName: 'muninnData',
        Item: item
    }, function(err, data) {
        if (err) {
            console.log(err, err.stack);
        } else {
        }
    });
}

// https://stackoverflow.com/a/45899308
var EPOCH = 1314220021721;
function generateRowId(subid) {
    var ts = new Date().getTime() - EPOCH; // limit to recent
    var randid = Math.floor(Math.random() * 512);
    ts = (ts * 64);   // bit-shift << 6
    ts = ts + subid;
    return (ts * 512) + (randid % 512);
}