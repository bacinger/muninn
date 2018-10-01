'use strict';
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

exports.handler = function(event, context, callback) {
    let host;
    let ip = '127.0.0.1';
    let source;
    let url;
    let ua;
    let width;
    let height;
    let response;
    let ts = new Date().getTime();
    let responseCode = 200;
    console.log('request: ' + JSON.stringify(event));

    // We use proxy to store the host
    if (event.pathParameters !== null && event.pathParameters !== undefined) {
        if (event.pathParameters.proxy !== undefined && 
            event.pathParameters.proxy !== null && 
            event.pathParameters.proxy !== '') {
            host = event.pathParameters.proxy;
        }
    }

    // Getting the IP address form the header
    if (event.headers !== null && event.headers !== undefined) {
        if (event.headers['X-Forwarded-For'] !== undefined && event.headers['X-Forwarded-For'] !== null && event.headers['X-Forwarded-For'] !== "") {
            ip = event.headers['X-Forwarded-For'];
            console.log('IP: ' + event.headers['X-Forwarded-For']);
        }
    }

    // Getting the rest of the data from the body JSON
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
                'ip': {'S': ip.toString()},
                'timestamp': {'S': ts.toString()},
                'date': {'S': new Date(ts).toISOString()},
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
                'ip': {'S': ip.toString()},
                'timestamp': {'S': ts.toString()},
                'date': {'S': new Date(ts).toISOString()},
                'host': {'S': host},
                'source': {'S': 'noscript'}
            };
        }
        saveToDynamodb(item);
        var responseBody = {
            message: "Successful"
        };
        response = {
            statusCode: responseCode,
            headers: {
                'Access-Control-Allow-Origin' : "*" // Required for CORS support to work
            },
            body: JSON.stringify(responseBody)
        };
    }
    else {
        // GET
        let item = {
            'id': {'N': generateRowId(4).toString()},
            'ip': {'S': ip.toString()},
            'timestamp': {'S': ts.toString()},
            'date': {'S': new Date(ts).toISOString()},
            'host': {'S': host},
            'source': {'S': 'noscript'}
        };
        saveToDynamodb(item); 
        // https://stackoverflow.com/questions/35804042/aws-api-gateway-and-lambda-to-return-image
        var content = 'data:image/png;base64,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';
        response = {
            statusCode: responseCode,
            headers: {
                'Content-Type': 'image/png',
                'Access-Control-Allow-Origin' : "*" // Required for CORS support to work
            },
            body: content.toString('base64'),
            isBase64Encoded: true
        };
    }
    
    console.log('response: ' + JSON.stringify(response));
    callback(null, response);
};

// Save collected data to the database
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

// Generate ID (https://stackoverflow.com/a/45899308)
var EPOCH = 1314220021721;
function generateRowId(subid) {
    var ts = new Date().getTime() - EPOCH; // limit to recent
    var randid = Math.floor(Math.random() * 512);
    ts = (ts * 64);   // bit-shift << 6
    ts = ts + subid;
    return (ts * 512) + (randid % 512);
}