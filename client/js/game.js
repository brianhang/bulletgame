var socket = io();

$(document).ready(function() {
	initialize();
})

function initialize() {
	var renderer = new PIXI.WebGLRenderer(512, 512);

	renderer.backgroundColor = 0x048542;
	renderer.view.style.position = "absolute";
	renderer.view.style.display = "block";
	renderer.autoResize = true;
	renderer.resize($(document).width(), $(document).height());
	

	document.body.appendChild(renderer.view);

	var stage = new PIXI.Container();

	renderer.render(stage);

	window.addEventListener("resize", function(event){
		renderer.resize($(document).width(), $(document).height());
	});
}