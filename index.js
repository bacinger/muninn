'use strict';

exports.handler = function(event, context, callback) {
    let host;
    let name;
    let day;
    let response;
    let responseCode = 200;
    console.log("request: " + JSON.stringify(event));
    
    // We use proxy to store host
    if (event.pathParameters !== null && event.pathParameters !== undefined) {
        if (event.pathParameters.proxy !== undefined && 
            event.pathParameters.proxy !== null && 
            event.pathParameters.proxy !== "") {
            host = event.pathParameters.proxy;
        }
    }

    if (event.body !== null && event.body !== undefined) {
        // POST
        let body = JSON.parse(event.body);
        if (body.day) 
            day = body.day;
        if (body.name)
            name = body.name;

        let out = 'Not enough data';
        if (day) 
            out = 'Happy ' + day;
        if (name)
            out += ', ' + name;

        var responseBody = {
            message: out
        };
        response = {
            statusCode: responseCode,
            body: JSON.stringify(responseBody)
        };
    }
    else {
        // GET
        var content = "<img src='https://svemir.co/space-pig.png' alt=''>";
        response = {
            "statusCode": 200,
            "body": content,
            "headers": {
                'Content-Type': 'text/html',
            }
        };
    }
    
    console.log('response: ' + JSON.stringify(response));
    callback(null, response);
};