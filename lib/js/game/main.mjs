import * as THREE from '../threejs/three.module.js';
import { OrbitControls } from '../threejs/jsm/controls/OrbitControls.js';
import * as LEVEL from './level.mjs';
//import * as MATH from 'https://unpkg.com/mathjs@6.2.3/main/esm/index.js';

// TEMPORARY - FOR DEBUGGING
LEVEL.load(`usr/lvl/garten/garten.json`)
	.then(r =>{console.log(r); return r})
	.then(r => scene.add(r.level))

var camera, controls, scene, renderer;
var mesh, ambientLight, file;
var clock = new THREE.Clock();

init();
animate();
function init() {
	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.z = 40;
	camera.position.y = 30;
	scene = new THREE.Scene();

	var ambientLight = new THREE.AmbientLight( 0xffffff, 0.3 );
	scene.add( ambientLight );

	var light = new THREE.PointLight( 0xffffff, 1, 300 );
		light.position.set( 50, 50, 50 );
		light.castShadow = true;
	scene.add( light );

	// ENTITY.load("./usr/res/models/blonde_casual_HD/Main.json")
	// 	.then(r => {console.log(r); return r})
	// 	.then(r => scene.add(r.armature.object))
	// 	.then(r => console.log(scene))

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
	renderer.render( scene, camera );
}
