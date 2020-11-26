import * as THREE from '../threejs/three.module.js';
import { OrbitControls } from '../threejs/jsm/controls/OrbitControls.js';
import * as LEVEL from './level.mjs';
import * as CONTROLS from './controls.mjs';
//import * as MATH from 'https://unpkg.com/mathjs@6.2.3/main/esm/index.js';

// the json variable stores all data currently loaded as a level/etc
var json;
// three.js specific stuff
	var camera, controls, scene, renderer;
// scene specific things (will be merged to level)
	var ambientLight;
var clock = new THREE.Clock();

function init() {
	// initialize & configure a new THREE.js scene
	// and load a new level
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

	// load in a level
	LEVEL.load(`usr/lvl/insel/insel.json`)
		.then(r =>{json = r; return r})
		.then(r => {
			// r.level.position.set(100,0,0);
			let update = LEVEL.getPC(r.level)
				.map(e => new CONTROLS.Keyboard(e))
				.reduce(
					(a,b) => (_ =>{
						a();
						b.update()
					}),
					_ => {}
				)

			r.level.userData.update.push(update);
					// r.level.userData.update.push(
					// 	k.update
					// );
			return r;
		})
		.then(r => scene.add(r.level))
		.then(r => console.log(json))

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
	// change the THREE.js renderer in case the window gets resized
	// without this code, the rendered game would have a fixed size
	// and cannot change dynamically like the window
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}
function animate() {
	var delta = clock.getDelta();
	// if the level has been loaded, update it.
	if(json!=undefined){
		window.json = json;
		json.update(delta);
	}
	renderer.render( scene, camera );
	requestAnimationFrame( animate );
}

// Start the game
init();
animate();
