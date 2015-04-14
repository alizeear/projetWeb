
var express    = require('express');
var bodyParser = require('body-parser');
var cors       = require('cors');
var http       = require('http');
var nano       = require('nano')('http://localhost:5984');
var db         = nano.db.use('projetweb');
var httpClient = require('./HttpClient');

var app = express();
app.use(bodyParser.json());
app.use(cors());

var id_cat = "";
var rev_cat = "";
var songs_cat = [ ];

app.get('/projetweb/tracks/allTracks', function(request, response){
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

app.get('/projetweb/tracks/catalogueTracks', function(request, response){
    http.get('http://localhost:5984/projetweb/catalogue', function(res){
        var data = "";
        res.setEncoding('utf8');
        res.on("data", function (chunk) {
            data += chunk;
            data = JSON.parse(data);
            id_cat = data._id;
            rev_cat = data._rev;
            songs_cat = data.data;
        });
        res.on('end', function(){
            response.json(songs_cat);
        });
    });
});

app.put('/projetweb/tracks/catalogueTracks', function(request, response){
    var song = request.body.data;
    var alreadyIn = false;
    for(i = 0; i < songs_cat.length; i++){
        if(song == songs_cat[i])
            alreadyIn = true;
    }
    if(alreadyIn){
        db.insert({_id: id_cat, _rev: rev_cat, data: songs_cat}, function(err, body){
            if(!err)
                console.log("{\n\tid: " + id_cat + "\n\t_rev: " + rev_cat + "\n\tdata:[" + songs_cat + "](Inchangé)\n}");
        });
    }
    else{
        songs_cat.push(song);
        db.insert({_id: id_cat, _rev: rev_cat, data: songs_cat}, function(err, body){
            if(!err)
                console.log("{\n\tid: " + id_cat + "\n\t_rev: " + rev_cat + "\n\tdata:[" + songs_cat + "]\n}");
        });
    }
    response.json(songs_cat);
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







