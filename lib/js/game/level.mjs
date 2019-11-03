// load a full level including
// 	- the voxel map
// 	- the entities
// 	- scripts to execute

import * as THREE from '../threejs/three.module.js';
import * as BUILDER from './builder.mjs';
import * as ENTITY from './entity.mjs';

export{
	load
}

async function load(url){
	// create a new group that will store all objects inside the level
	let level = new THREE.Group();
	// load and build the voxel map
	let json = await BUILDER.load(url);
		// add all the voxelmap geometries as a new subgroup to the level
		let voxels = new THREE.Group();
			voxels.name = "voxels";
		json.mesh.forEach(m => voxels.add(m.mesh))
		level.add(voxels)
	// load the entities into the level
	let entities = new THREE.Group();
	ENTITY.loadFromLayers(json.layers)
		.then(r => r.flat(1))
		.then(r => r.forEach(e => entities.add(e.object)))
	level.add(entities);
	json = Object.assign(json, {level: level})
	return json
}
