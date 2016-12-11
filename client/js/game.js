var socket = io();

var player = new Player(-1, 0, 0);
var players = [];

var stage;
var renderer;

$(document).ready(function() {
	initialize();

	requestAnimationFrame(render);
})

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
	renderer.render(stage);
}

// Called when mouse is moved
$(document).mousemove(function(event) {
	// Check if player sprite exists to turn
	if (player.sprite !== undefined) {

		// Get the angle of mouse from the sprite	
		var angle = Math.atan2(event.pageY - player.sprite.position.y, 
							   event.pageX - player.sprite.position.x);

		// Send heading information to server
		socket.emit("turn", angle); 
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
	client.heading = Math.random()*360//data.heading || 0;
	client.thrust = data.thrust || 0;

	// Set 
	players[client.id] = client;

	// Load ship textures
	client.sprite = PIXI.Sprite.fromImage("assets/images/ship.png");
	
	// Set coordinates
	client.sprite.position.x = data.x;
	client.sprite.position.y = data.y;
	client.sprite.rotation = client.heading;

	// Put sprite is in middle of position
	client.sprite.anchor.set(0.5, 0.5);


	stage.addChild(client.sprite);
});

// Called when a player leaves the game
socket.on("leave", function(id) {
	// Delete player's sprite
	stage.removeChild(players[id].sprite);
	delete players[id];
})

// Called when a player changes position
socket.on("move", function(id, x, y) {
	var other = players[id];
	other.x = data.x;
	other.y = data.y;

	stage.addChild(other.sprite);
})

// Called when a player changes angles
socket.on("turn", function(id, angle) {
	var other = players[id];
	other.heading = data.heading;

	stage.addChild(other.sprite);

})