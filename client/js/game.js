var TO_RADIANS = (180 / Math.PI)
var ANGLE_STEP = Math.PI / 10

var socket = io();

var player = new Player(-1, 0, 0);
var players = [];

var stage;
var renderer;

$(document).ready(function() {
    initialize();

    $(document).keydown(onKeyDown);
    $(document).keyup(onKeyUp);
    requestAnimationFrame(render);
})

// Sets up background and the stage
function initialize() {
    // Create the renderer
    renderer = new PIXI.WebGLRenderer(512, 512);

    // Background
    renderer.backgroundColor = 0x1a1a1a;
    renderer.view.style.position = "absolute";
    renderer.view.style.display = "block";
    renderer.autoResize = true;
    renderer.resize($(document).width(), $(document).height());
    
    // Add canvas 
    document.body.appendChild(renderer.view);

    // Create container
    stage = new PIXI.Container();

    renderer.render(stage);

    // Resize whenever window is resized
    window.addEventListener("resize", function(event){
        renderer.resize($(document).width(), $(document).height());
    });
}

// Call when a frame needs to be rendered
function render() {
    requestAnimationFrame(render);

    players.map(function(player) {
        player.deltaX += (player.x - player.deltaX) * 0.16;
        player.deltaY += (player.y - player.deltaY) * 0.16;
        player.deltaHeading = (player.deltaHeading - player.heading) % Math.PI*2

        player.sprite.x = player.deltaX;
        player.sprite.y = player.deltaY;
        player.sprite.rotation = player.deltaHeading - Math.PI/2;
    });

    renderer.render(stage);
}

// Called when a keyboard button is being held down.
function onKeyDown(keyEvent) {
    if (player.sprite !== undefined && keyEvent.which === 32 &&
        !player.increaseThrust) {
        socket.emit("thrust", true);
        player.increaseThrust = true;

        keyEvent.preventDefault();
    }
}

function onKeyUp(keyEvent) {
    if (player.sprite !== undefined && keyEvent.which === 32 &&
        player.increaseThrust) {
        socket.emit("thrust");
        player.increaseThrust = false;

        keyEvent.preventDefault();
    }
}

// Called when mouse is moved
$(document).mousemove(function(event) {
    // Check if player sprite exists to turn
    if (player.sprite !== undefined) {
        // Get the angle of mouse from the sprite   
        var angle = Math.atan2(player.sprite.position.y - event.pageY, 
                               player.sprite.position.x - event.pageX);

        if (Math.abs(angle - player.getHeading()) > ANGLE_STEP) {
            // Send heading information to serverA
            socket.emit("turn", angle);
        }
    }
});


// Called when a player joins a game
socket.on("join", function(data, isLocalPlayer) {
    var client;

    if (isLocalPlayer) {
        client = player;
    } else {
        client = new Player(-1, 0, 0);
    }

    // Copy information from server
    client.id = data.id;
    client.x = data.x;
    client.y = data.y;
    client.deltaX = client.x;
    client.deltaY = client.y;
    client.heading = Math.random()*360//data.heading || 0;
    client.deltaHeading = client.heading;
    client.thrust = data.thrust || 0;

    // Set 
    players[client.id] = client;

    // Load ship textures
    client.sprite = PIXI.Sprite.fromImage("assets/images/ship.png");
    
    // Set coordinates
    client.sprite.x = data.x;
    client.sprite.y = data.y;
    client.sprite.rotation = client.heading;

    // Put sprite is in middle of position
    client.sprite.anchor.set(0.5, 0.5);


    stage.addChild(client.sprite);
});

// Called when a player leaves the game
socket.on("leave", function(id) {
    // Delete player's sprite and the player itself
    stage.removeChild(players[id].sprite);
    delete players[id];
})

// Called when a player changes position
socket.on("move", function(id, x, y) {
    var other = players[id];

    if (other === undefined) {
        return;
    }

    other.x = x;
    other.y = y;
})

// Called when a player changes angles
socket.on("turn", function(id, angle) {
    var other = players[id];

    // Move the given player to the given angle.
    if (other !== undefined) {
        other.heading = angle;
    }
})