// entity.mjs
// Load Entities into the game
//

import * as PATH from '../path/path.mjs';
import * as THREE from '../threejs/three.module.js';
import { FBXLoader } from '../threejs/jsm/loaders/FBXLoader.js';
import { layersWithProperty } from './builder.mjs';

// use like this
	// ENTITY.load("./usr/res/models/blonde_casual_HD/Main.json")
	// 	.then(r => scene.add(r.armature.object))

// load a fbx file and create the mixer, updater and mesh(object) for it
// load :: URL -> Armature:[Object,mixer,update]
const load = async url => await fetch(url)
	.then(r => r.json())
	.then(async r => await new Promise( (res,rej) => {
		// URL to the fbx file (declated in the .json)
		// that stores the character
		let fbxURL = PATH.join(
			location.href,
			PATH.dirname(url),
			r.url
		);
		console.log("TEST TEST TEST TEST");
		console.log(fbxURL, location.href)
		var loader = new FBXLoader();
		loader.load( fbxURL, function ( object ) {
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
			// use this function every update of the game to
			// update this entity
			let update = (delta) => {
				mixer.update(delta)
			};
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

// load all the entities specified in a layer of a tiledmap
// loadFromLayer :: JSON -> [Armature]
const loadFromLayer = async (
	layer,
	height,
	json,
	block
) => await Promise.all(
	layer.objects
		.filter(o => o.properties.filter(p => p.name=="obj").length>0)
		.map(async o =>
			await load(o.properties
				.filter(p => p.name=="obj")
				[0].value
			)
			.then(r => Object.assign(
				r,
				{
					tileddata: o
				})
			)
		)
	)
	.then(r => {
		r.forEach(e =>{
		// set the scale correctly for each entity
			// get the bounding box
				let b = new THREE.Box3().setFromObject(e.object);
				let s = b.getSize();
			// calculate the difference in height
				let d = height/s.y;
			// change the scale of the entity to
			// fit the level height
				e.object.scale.multiplyScalar(d);
			// divide the scale of the entity by the number of
			// tiles vertically in the level
				e.object.scale.multiplyScalar(1/json.height);
			// scale the entity to its supposed height
				e.object.scale.multiplyScalar(e.json.height);
		// set the position correctly
			// calculate the position
				let x = e.tileddata.x
						/json.tilewidth
						*block.size.x;
				let y = (json.height
						-e.tileddata.y
						/json.tileheight)
						*block.size.y;
				let z = e.tileddata.properties
						.find(p => p.name=="z")
						.value
						*block.size.z;
			// change the position of the object
				e.object.position.set(x,y,z);
		})
		return r
	})

// filter the entitylayers and apply loadFromLayer to multiple layers
// loadFromLayers :: JSON -> [[Armature]]
const loadFromLayers = async (
	layers,
	height,
	json,
	block
) => await Promise.all(
	layersWithProperty(layers,"entityLayer")
		.map(async l => await loadFromLayer(l,height,json,block))
)

export {
	load,
	loadFromLayer,
	loadFromLayers,
}
