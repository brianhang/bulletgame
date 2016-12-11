"use strict"

var SERVER_FPS = 30;

var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var Player = require("../shared/player").Player;

var TWO_PI = Math.PI * 2

// Start the webserver for the game on localhost:8080
app.use(express.static(__dirname + "/../client"))
http.listen(8080)

var players = [];

// Add a player to the game when someone joins.
io.on("connection", function(socket) {
    var id = 0;

    // Find an unused index for the player.
    while (id in players) {
        id++;
    }

    var player = new Player(id, Math.random() * 256, Math.random() * 256);
    player.socket = socket;

    players[id] = player;
    
    // Remove the player from the player list when disconnecting.
    socket.on("disconnect", function() {
        io.emit("leave", id);
        delete players[id];

        console.log("Player " + id + " has left the game.");
    });

    // Update the player heading when the mouse is moved.
    socket.on("turn", function(newHeading) {
        if (newHeading > Math.PI) {
            newHeading = Math.PI;
        } else if (newHeading < -Math.PI) {
            newHeading = -Math.PI;
        }

        player.heading = newHeading;
        io.volatile.emit("turn", id, newHeading);
    });

    // Called when the player wants to change their thrust.
    socket.on("thrust", function(shouldIncrease) {
        if (shouldIncrease) {
            player.increaseThrust = true;
        } else {
            player.increaseThrust = false;
        }
        console.log(player.increaseThrust);
    })

    // Network existing players to the player.
    players.forEach(function(client) {
        var playerData = {
            "id": player.id,
            "x": player.x,
            "y": player.y
        };

        if (!client.equals(player)) {
            client.socket.emit("join", playerData);

            socket.emit("join", {
                "id": client.id,
                "x": client.x,
                "y": client.y,
                "heading": client.getHeading(),
                "thrust": client.getThrust()
            });
        } else {
            socket.emit("join", playerData, true);
        }
    });

    console.log("Player " + id + " has joined the game.");
});