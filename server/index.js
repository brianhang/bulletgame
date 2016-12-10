var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);

// Start the webserver for the game on localhost:8080
app.use(express.static(__dirname + "/../client"))
http.listen(8080)

var players = [];

// Add a player to the game when someone joins.
io.on("connection", function(socket) {
    console.log("Bloop")
    console.log(players[0] === null);
})