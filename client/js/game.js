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

// Called when a player joins a game
socket.on("join", function(data, isLocalPlayer) {
	var client;

	if (isLocalPlayer) {
		client = player;
	} else {
		client = new Player(-1, 0, 0);
	}

	client.id = data.id;
	client.x = data.x;
	client.y = data.y;
	client.heading = data.heading || 0;
	client.thrust = data.thrust || 0;

	players[client.id] = client;

	// Load ship textures
	client.sprite = PIXI.Sprite.fromImage("assets/images/ship.png");
	// Set coordinates
	client.sprite.position.x = client.x;
	client.sprite.position.y = client.y;


	stage.addChild(client.sprite);
});

socket.on("leave", function(id) {
	delete players[id];
})