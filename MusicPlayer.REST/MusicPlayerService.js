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
var id_play = "";
var rev_play = "";
var songs_play = [ ];
var positionTrackPlaylist = 0;
var trackPosition = 0;

// GET //////////////////////////////////

app.get('/projetweb/tracks/allTracks', function(request, response){
    http.get("http://localhost:5984/projetweb/tracks", function(res) {
        var data = "";
        res.setEncoding('utf8');
        res.on("data", function (chunk) {
            data += chunk;
            var datas = JSON.parse(data);
            id_play = datas._id;
            rev_play = datas._rev;
            songs_play = datas.data;
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

app.get('/playlist/getPositionTrackPlaylist', function (request, response) {
    //console.log('positionTrackPlaylist : '+positionTrackPlaylist);
    response.json(positionTrackPlaylist);
});

app.get('/playlist/numTrack', function (request, response) {
    //console.log('trackPosition : '+trackPosition);
    response.json(trackPosition);
});

// PUT //////////////////////////////////

app.put('/projetweb/tracks/allTracks', function(request, response){
    var song = {id: request.body.id, vote: request.body.vote};
    var update = true;
    for(i = 0; i < songs_play.length; i++){
        if(songs_play[i].id == song.id){
            update = false;
            if(songs_play[i].vote != song.vote){
                songs_play[i].vote = song.vote
            }
        }
    }
    if(update)
        songs_play.push(song);
    db.insert({_id: id_play, _rev: rev_play, data: songs_play}, function(err, body){
        if(!err)
            console.log("{\n\tid: " + id_play + "\n\t_rev: " + rev_play + "\n\tdata:[" + songs_play + "]\n}");
    });

    response.json(song);
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
    response.json(song);
});

// DELETE //////////////////////////////////

app.delete('/projetweb/catalogueTracks/delete/:id', function(request, response){
    var song = request.params['id'];
    var newCat = [];
    for(i = 0; i < songs_cat.length; i++){
        if(songs_cat[i] != song)
            newCat.push(songs_cat[i]);
    }
    songs_cat = newCat;
    db.insert({_id: id_cat, _rev: rev_cat, data: songs_cat}, function(err, body){
        if(!err)
            console.log("{\n\tid: " + id_cat + "\n\t_rev: " + rev_cat + "\n\tdata:[" + songs_cat + "]\n}");
    });
    response.json(song);
});

// POST //////////////////////////////////

app.post('/playlist/positionTrackPlaylist' , function (request, response) {
    var data = request.body;
    positionTrackPlaylist = data.position;
    trackPosition = data.numTrack;
    response.send("ok");
});

// SERVEUR //////////////////////////////////

var server = app.listen(3000, function () {
    console.log('Listening at http://localhost:%s', server.address().port);
});