// load a full level including
// 	- the voxel map
// 	- the entities
// 	- scripts to execute

import * as THREE from '../threejs/three.module.js';
import * as BUILDER from './builder.mjs';
import * as ENTITY from './entity.mjs';

const block = {
	size : new THREE.Vector3(8,8,8)
}

// load :: URL -> JSON
async function load(url){
	// create a new group that will store all objects inside the level
		let level = new THREE.Group();
	// create an array for all the functions
	// that update stuff in the level
		let update = [];
	// load and build the voxel map
		let json = await BUILDER.load(url);
	// add all the voxelmap geometries as a new subgroup to the level
		let voxels = new THREE.Group();
			voxels.name = "voxels";
			json.mesh.forEach(m => voxels.add(m.mesh))
		level.add(voxels)
	// scale the voxels
		voxels.scale.set(...block.size.toArray());
	// calculate the bounding box of the voxels
		let bbox = new THREE.Box3().setFromObject(voxels);
	// create a group for all the entities
		let entities = new THREE.Group();
			entities.name = "entities"
	// load the entities into the level
		await ENTITY.loadFromLayers(
			json.layers,
			bbox.getSize().y,
			json,
			block
		)
		// merge all the entities from different
		// layers into one entity list
			.then(r => r.flat(1))
			.then(r => {
				console.log(r);
				return r
			})
			.then(r => r.forEach(e =>{
				// add the entity's update function to the
				// level update-function-array
				e.object.userData = e;
				update.push(e.update);
				// add each entity into the scene
				entities.add(e.object)
				entities.add(e.skeleton)
				entities.add(e.boxhelper)
			}))
		level.add(entities);
	// add the update functions to the level.userData
		level.userData["update"] = update;
	// add a global update update function for the entire json
		json.update = delta => {
			// call all userData update functions
			level.userData.update
				.forEach(f =>
					f(delta, json)
				);
		}
	return Object.assign(
		json,
		{
			level: level,
			block, block
		}
	)
}

// getLayer :: level -> string -> [Object]
const getLayer = (level,name) => level
	.children
	.find(x => x.name == name)

// getEntities :: level -> [Entity]
const getEntities = (level) => getLayer(level,"entities")
	.children;

// getPC :: level -> [Entity]
const getPC = level => ENTITY.getPC(getEntities(level));

// getNPC :: level -> [Entity]
const getNPC = level => ENTITY.getNPC(getEntities(level));

// getEntities :: level -> [Voxel]
const getVoxels = (level) => getLayer(level,"voxels");

export{
	getEntities,
	getLayer,
	getPC,
	getNPC,
	getVoxels,
	load,
}
