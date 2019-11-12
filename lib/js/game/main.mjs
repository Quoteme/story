import * as THREE from '../threejs/three.module.js';
import { OrbitControls } from '../threejs/jsm/controls/OrbitControls.js';
import * as LEVEL from './level.mjs';
//import * as MATH from 'https://unpkg.com/mathjs@6.2.3/main/esm/index.js';



var json;
// three.js specific stuff
	var camera, controls, scene, renderer;
// scene specific things (will be merged to level)
	var ambientLight,boxes;
var clock = new THREE.Clock();

init();
animate();
function init() {
	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.set(
		150,
		100,
		100
	)
	scene = new THREE.Scene();

	var ambientLight = new THREE.AmbientLight( 0xffffff, 0.3 );
	scene.add( ambientLight );

	var light = new THREE.PointLight( 0xffffff, 1, 300 );
		light.position.set( 100, 100, 70 );
		light.castShadow = true;
	scene.add( light );

	// TEMP for viewing bounding boxes
	boxes = new THREE.Group();

	// load in a level
	LEVEL.load(`usr/lvl/garten/garten.json`)
		.then(r =>{json = r; return r})
		.then(r => scene.add(r.level))
		.then(r => {
			console.log(json);
		})
		.then(r => LEVEL.getEntities(json.level)
			.children
			.forEach(e =>{
				let box = new THREE.BoxHelper(e)
				console.log(e,box)
				boxes.add(box)
			})
		)
	scene.add(boxes);
	//TODO add the ability to play animations for
	// entities (ie. use the .update() method)

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.shadowMapEnabled = true;
	renderer.shadowMapType = THREE.PCFSoftShadowMap;
	document.body.appendChild( renderer.domElement );
	//
	controls = new OrbitControls( camera, renderer.domElement );
	//
	window.addEventListener( 'resize', onWindowResize, false );
}
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}
function animate() {
	requestAnimationFrame( animate );
	var delta = clock.getDelta();
	if(json!=undefined)
		json.level.userData.update
			.forEach(f =>
				f(delta,json)
			);
	if(boxes.children!=undefined)
		boxes.children.forEach(e => e.update())
	renderer.render( scene, camera );
}
