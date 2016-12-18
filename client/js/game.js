var TO_RADIANS = (180 / Math.PI);
var TO_DEGREE = (180 / Math.PI);
var ANGLE_STEP = Math.PI / 10;

var socket = io();

var player = new Player(-1, 0, 0);
var players = [];

var stage;
var renderer;

var POLL_DELAY = 50;

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

var elapsed = Date.now();

// Call when a frame needs to be rendered
function render() {    
    requestAnimationFrame(render);

    if (player.sprite === undefined) {
        return;
    }
    
    var now = Date.now();

    // Update each player's position.
    players.map(function(client) {
        client.deltaX += (client.x - client.deltaX) * 0.16;
        client.deltaY += (client.y - client.deltaY) * 0.16;
        client.deltaHeading = (client.deltaHeading - client.heading) % Math.PI*2

        client.sprite.x = client.deltaX;
        client.sprite.y = client.deltaY;
        client.sprite.rotation = client.heading - Math.PI/2;

        client.thrustParticles.updateSpawnPos(client.sprite.x, client.sprite.y);
        client.thrustParticles.update((now - elapsed) * 0.001);
    });

    // Get when this frame was drawn.
    elapsed = now;

    // Center the stage to the player's sprite.
    stage.pivot.x = player.sprite.x - $(document).width() * 0.5;
    stage.pivot.y = player.sprite.y - $(document).height() * 0.5;

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
        var halfScrW = $(document).width() * 0.5;
        var halfScrH = $(document).height() * 0.5;

        // Get the angle of mouse from the sprite   
        var angle = Math.atan2(halfScrH - event.pageY, 
                               halfScrW - event.pageX);

        if (Math.abs(angle - player.getHeading()) > ANGLE_STEP) {
            // Send heading information to serverA
            socket.emit("turn", angle);
        }
    }
});


// Called when a player joins a game
function playerJoined(data, isLocalPlayer) {
    var client;

    if (isLocalPlayer) {
        client = player;
    } else if (players[data.id]) {
        client = players[data.id];
        console.log("Duplicate" + data.id);
    } else {
        client = new Player(-1, 0, 0);
    }

    // Copy information from server
    client.id = data.id;
    client.x = data.x;
    client.y = data.y;
    client.deltaX = client.x;
    client.deltaY = client.y;
    client.heading = data.heading || 0;
    client.deltaHeading = client.heading; 
    client.thrust = data.thrust || 0;

    // Set 
    players[client.id] = client;

    // Load ship textures
    client.sprite = PIXI.Sprite.fromImage("assets/images/ship.png");
    
    var startColor = "fb1010";
    var endColor = "f5b830";

    if (isLocalPlayer) {
        startColor = "59abe3";
        endColor = "81cfe0";
    }

    client.thrustParticles = new PIXI.particles.Emitter(
    	stage,
    	[PIXI.Texture.fromImage("assets/images/bullet.png")],

	    {
	        alpha: {
	            start: 1.0,
	            end: 0
	        },
	        scale: {
	            start: 1.5,
	            end: 0.2
	        },
	        color: {
	            start: startColor,
	            end: endColor
	        },
	        speed: {
	            start: 0,
	            end: 0
	        },
	        startRotation: {
	            min: 60,//(client.deltaHeading) - 10, 
	            max: 120//(client.deltaHeading) + 10
	        },
	        rotationSpeed: {
	            min: 0,
	            max: 360
	        },
	        lifetime: {
	            min: 1,
	            max: 1.5
	        },
	        frequency: 0.075,
	        maxParticles: 50,
	        pos: {
	            x: client.x,
	            y: client.y
	        },
	        addAtBack: true,
	        spawnType: "circle",
	        spawnCircle: {
	            x: 0,
	            y: 0,
	            r: 0
        	}
    	}
	);

	client.thrustParticles.emit = true;


    // Set coordinates
    client.sprite.x = data.x;
    client.sprite.y = data.y;
    client.sprite.rotation = client.heading;

    // Put sprite is in middle of position
    client.sprite.anchor.set(0.5, 0.5);

    stage.addChild(client.sprite);
}

socket.on("join", function(data, isLocalPlayer) {
    function pollStage() {
        if (stage !== undefined) {
            playerJoined(data, isLocalPlayer);
        } else {
            setTimeout(playerJoined, POLL_DELAY, data, isLocalPlayer);
        }
    }

    setTimeout(playerJoined, POLL_DELAY, data, isLocalPlayer);
});

// Called when a player leaves the game
socket.on("leave", function(id) {
    // Delete player's sprite and the player itself
    stage.removeChild(players[id].sprite);
    players[id].thrustParticles.destroy();

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