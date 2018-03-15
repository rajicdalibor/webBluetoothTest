/**
 * This is an example of a basic node.js script that performs
 * the Client Credentials oAuth2 flow to authenticate against
 * the Spotify Accounts.
 */

const express = require('express');
const request = require('request');
const path = require('path');

var client_id;
var client_secret;
var args = process.argv.slice(2);

// Checking for passed arguments
// Otherwise loading testing defaults
for (var i = 0; i < args.length; i++) {
    var argument = args[i];
    if (argument.indexOf('client_id=') > -1) {
        client_id = args[i].substr(args[i].indexOf('id=') + 3);
        console.log(client_id);
    }
    if (argument.indexOf('client_secret=') > -1) {
        client_secret = args[i].substr(args[i].indexOf('secret=') + 7);
        console.log(client_secret);
    }
}

// Hardcoded values for testing
if (!client_id) {
    client_id = '47a820b68b8745eebcc1cc3fb2c06cac';
}
if (!client_secret) {
    client_secret = '574779fcd77c4156870ca6c19b8d9d64';
}

const app = express();
const PORT = process.env.PORT || 8888;

var token = "";

// Serve address
app.use(express.static(path.resolve(__dirname, './dist')));

// Token request
app.get('/token', function (req, res) {
    if(req.query.hasOwnProperty('initial') && req.query['initial'] == 'true'){
        res.set('Content-Type', 'application/json');
        res.send('{"token":"' + token + '"}');
    } else {
        setTimeout(function () {
            res.set('Content-Type', 'application/json');
            res.send('{"token":"' + token + '"}');
        },25000);
    }
});

// Routing from app requests.
app.get('*', function(request, response) {
    response.sendFile(path.resolve(__dirname, './dist', 'index.html'));
});

// Authorization setup
var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
    },
    form: {
        grant_type: 'client_credentials'
    },
    json: true
};

// Requesting for new token
var requestForToken = function() {
    request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            // use the access token to access the Spotify Web API
            token = body.access_token; 
            // Checking for new token 40 seconds before expiring
            setTimeout(requestForToken, (body.expires_in - 30) * 1000);

        }
    });
};

// Initial request
requestForToken();

app.listen(PORT, function () {
    console.log('Listening on port '+PORT);
});
