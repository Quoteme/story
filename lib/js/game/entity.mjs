// entity.mjs
// Load Entities into the game
//
import * as THREE from '../threejs/three.module.js';
import { FBXLoader } from '../threejs/jsm/loaders/FBXLoader.js';
import { layersWithProperty } from './builder.mjs';

// load a fbx file and create the mixer, updater and mesh(object) for it
// load :: URL -> Armature:[Object,mixer,update]
const load = async url => await fetch(url)
	.then(r => r.json())
	.then(async r => await new Promise( (res,rej) => {
		var loader = new FBXLoader();
		loader.load( './usr/res/models/blonde_casual_HD/Main.fbx', function ( object ) {
			// add a mixer to switch between animtions
			let mixer = new THREE.AnimationMixer( object );
			var action = mixer.clipAction( object.animations[ 0 ] );
			action.play();
			// allow shadows to be used
			object.traverse( function ( child ) {
				if ( child.isMesh ) {
					child.castShadow = true;
					child.receiveShadow = true;
				}
			} );
			// fit the object to the scene
			object.scale.set(2,2,2);
			// use this function every update of the game to
			// update this entity
			let update = () => "";
			// resolve this promise
			res({
				object : object,
				mixer : mixer,
				update : update,
				json : r
			});
			} );
		})
	)

// load all the entites specified in a layer of a tiledmap
// loadFromLayer :: JSON -> [Armature]
const loadFromLayer = async layer => await Promise.all(
	layer.objects
		.filter(o => o.properties.filter(p => p.name=="obj").length>0)
		.map(async o =>
			await load(o.properties
				.filter(p => p.name=="obj")[0].value
			)
		)
)

// filter the entitylayers and apply loadFromLayer to multiple layers
// loadFromLayers :: JSON -> [[Armature]]
const loadFromLayers = async layers => await Promise.all(
	layersWithProperty(layers,"entityLayer")
		.map(async l => await loadFromLayer(l))
)

export {
	load,
	loadFromLayer,
	loadFromLayers
}
