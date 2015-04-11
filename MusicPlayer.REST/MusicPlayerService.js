
var express    = require('express');
var bodyParser = require('body-parser');
var cors       = require('cors');
var http       = require('http');

var httpClient = require('./HttpClient');

var app = express();
app.use(bodyParser.json());
app.use(cors());


var currentTrack   = null;
var proposedTracks = [60946206, 60946207, 60946208, 60946209];
var previousTracks = [ ];

app.get('/tracks/currentTrack', function (request, response) {
    response.json(currentTrack);
});

app.get('/projetweb/tracks/allTracks', function (request, response) {
    http.get("http://localhost:5984/projetweb/tracks", function(res) {

        var data = "";
        res.setEncoding('utf8');

        res.on("data", function (chunk) {
            data += chunk;
        });

        res.on('end', function () {
            response.json(data);
        });


    });
});

app.get('/tracks/proposedTracks', function (request, response) {
    response.json(proposedTracks);

});

app.get('/tracks/previousTracks', function (request, response) {
    response.json(previousTracks);
});

app.post('/tracks/nextTrack', function (request, response) {
    previousTracks.push(currentTrack);
    currentTrack = proposedTracks.shift();


    console.log("Current Track: "   + currentTrack);
    console.log("Proposed Tracks: " + proposedTracks);
    console.log("Previous Tracks: " + previousTracks);
    console.log("");

    response.json(currentTrack);
});

app.get('/artist/:id', function (request, response) {
    var url = 'http://api.deezer.com/artist/'+request.params.id+'/albums';

    var http = new httpClient();
    http.GET(url, onResponse);

    var infos = null;

    function onResponse(resp){
        var body = JSON.parse(resp.body);
        var tab = body.data;

        infos = body.data[0];
        response.json(infos.title);
        console.log(infos);
    }
});

var server = app.listen(3000, function () {
    console.log('Listening at http://localhost:%s', server.address().port);
});







