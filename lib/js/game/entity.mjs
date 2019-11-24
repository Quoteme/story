// entity.mjs
// Load Entities into the game
//

import * as PATH from '../path/path.mjs';
import * as PHYSICS from './physics.mjs';
import * as THREE from '../threejs/three.module.js';
import { FBXLoader } from '../threejs/jsm/loaders/FBXLoader.js';
import { layersWithProperty } from './builder.mjs';

function Entity (
	object,
	json
){
	this.object		= object;
	this.json		= json;
	this.mixer		= new THREE.AnimationMixer( this.object );;
	this.action		= this.mixer.clipAction( this.object.animations[ 0 ] );
	this.physics	= new PHYSICS.Entity( this.object );
	this.skeleton	= new THREE.SkeletonHelper( this.object );
	this.boxhelper	= new THREE.BoxHelper(this.skeleton);
	this.tileddata	= undefined;
	this.bbox		= _=> new THREE
		.Box3()
		.setFromObject(this.skeleton)
	this.update		= (delta,j) => {
		// update the animation
			this.mixer.update(delta);
		// update the physics
			this.physics.update(delta,j);
		this.boxhelper.update()
	}

	this.action.play();

	// allow shadows to be used
	this.object.traverse( function ( child ) {
		if ( child.isMesh ) {
			child.castShadow = true;
			child.receiveShadow = true;
		}
	} );
}

// load a fbx file and create the mixer, updater and mesh(object) for it
// load :: URL -> Armature:[Object,mixer,update]
const load = async url => await fetch(url)
	.then(r => r.json())
	.then(async r => await new Promise( (res,rej) => {
		// URL to the fbx file (declated in the .json)
		// that stores the character
			let fbxURL = PATH.join(
				PATH.dirname(url),
				r.url
			);
		// load the fbs file
			var loader = new FBXLoader();
			loader.load( fbxURL, object => res( new Entity(object,r) ) );
		})
	)

// load all the entities specified in a layer of a tiledmap
// loadFromLayer :: JSON -> [Entity]
const loadFromLayer = async (
	layer,
	height,
	json,
	block
) => await Promise.all(
	layer.objects
		.filter(o => o.properties.filter(p => p.name=="obj").length>0)
		.map(async o =>
			await load(
				'.'+o.properties
					.filter(p => p.name=="obj")
					[0].value
			)
			.then(r => {r.tileddata = o; return r})
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
// loadFromLayers :: JSON -> [[Entity]]
const loadFromLayers = async (
	layers,
	height,
	json,
	block
) => await Promise.all(
	layersWithProperty(layers,"entityLayer")
		.map(async l => await loadFromLayer(l,height,json,block))
)

const filterUserData = (
	entity,
	filter = (u => true),
) => entity
	.filter(e => Object.entries(e.userData).length != 0)
	.filter(e => filter(e))

const getPC = (...entity) => filterUserData(
	entity,
	u => u.tileddata.type == "PC"
)

const getNPC = (...entity) => filterUserData(
	entity,
	u => u.tileddata.type == "NPC"
)

export {
	filterUserData,
	getPC,
	getNPC,
	load,
	loadFromLayer,
	loadFromLayers,
}
