import * as THREE from '../threejs/three.module.js';
import { OrbitControls } from '../threejs/jsm/OrbitControls.js';
import * as BUILDER from './builder.mjs';
//import * as MATH from 'https://unpkg.com/mathjs@6.2.3/main/esm/index.js';

// TEMPORARY - FOR DEBUGGING
BUILDER.load(`usr/lvl/garten/garten.json`)
	.then(r =>{console.log(r); return r})
	.then(r => r.mesh.forEach(m => scene.add(m.mesh)))
	.then(r => console.log(r))

var camera, controls, scene, renderer;
var mesh, ambientLight;
init();
animate();
function init() {
	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.z = 40;
	camera.position.y = 30;
	scene = new THREE.Scene();

	var ambientLight = new THREE.AmbientLight( 0xffffff, 1 );
	scene.add( ambientLight );

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
	renderer.render( scene, camera );
}
