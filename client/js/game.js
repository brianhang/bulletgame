var socket = io();

let player = new Player(0, 0, 0);

$(document).ready(function() {
	initialize();
})

function initialize() {
	// Create the renderer
	var renderer = new PIXI.WebGLRenderer(512, 512);

	// Background
	renderer.backgroundColor = 0x1a1a1a;
	renderer.view.style.position = "absolute";
	renderer.view.style.display = "block";
	renderer.autoResize = true;
	renderer.resize($(document).width(), $(document).height());
	
	// Add canvas 
	document.body.appendChild(renderer.view);

	// Create container
	var stage = new PIXI.Container();

	renderer.render(stage);

	// Resize whenever window is resized
	window.addEventListener("resize", function(event){
		renderer.resize($(document).width(), $(document).height());
	});

	// Load Assets into texture cache
	PIXI.loader
		.add("assets/images/ship.png")
		.add("assets/images/bullet.png")
		.load(setup);

	function setup() {
		var shipSprite = new PIXI.Sprite(
			PIXI.loader.resources["assets/images/ship.png"].texture
		);
	
		// Draw ship
		stage.addChild(shipSprite);
		renderer.render(stage);
	}
	

}