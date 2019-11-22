// Functions for checking if a thing intersects with
// the voxel map in any way

import * as INTERSECT from '../intersect/intersect.mjs';
import * as THREE		from '../threejs/three.module.js';

const position2map = (p,vox,blocksize) => {
	p[0]-=1;
	if( INTERSECT.point2Array(p,vox) )
		return vox[p[0]][p[1]][p[2]];
	else
		return undefined
}

const position2grid = (p,blocksize,round=Math.floor) => p
	.reverse()
	.map((x,i) => round(x/blocksize[i]))

// box :: THREE.Box3 -> {
// 	top: Float, bottom: Float, left: Float, right: Float, front: Float, back: Float
// }
const box = (b) => ({
	top: [
		(b.min.x+b.max.x)/2,
		b.max.y,
		(b.min.z+b.max.z)/2,
	],
	bottom: [
		(b.min.x+b.max.x)/2,
		b.min.y,
		(b.min.z+b.max.z)/2,
	],
	left: [
		b.min.x,
		(b.min.y+b.max.y)/2,
		(b.min.z+b.max.z)/2,
	],
	right: [
		b.max.x,
		(b.min.y+b.max.y)/2,
		(b.min.z+b.max.z)/2,
	],
	front: [
		(b.min.x+b.max.x)/2,
		(b.min.y+b.max.y)/2,
		b.min.z,
	],
	back: [
		(b.min.x+b.max.x)/2,
		(b.min.y+b.max.y)/2,
		b.max.z,
	]
})

const box2grid = (box,blocksize) => Object.assign(
	{},
	...Object.keys(box).map(
		k => ({[k] : position2grid(
			box[k],
			blocksize,
			k=="left" || k== "top" || k=="front"
			? Math.ceil
			: (x => Math.floor(x))
		)})
	)
)

// box2map :: THREE.Box3 -> [[[Int]]] -> [int] ->
const box2map = (b,json) => {
	let p = box2grid(
		box(b),
		json.block.size.toArray()
	)
	return Object.assign(
		{},
		...Object.keys(p).map(
			k => ({[k] : position2map(p[k],json.vox.vox)})
		)
	)
}

function Collision(){
	// box :: {bottom: [Float,Float,Float], top: [...], ...}
	this.box;
	// collision :: {bottom: Maybe Int, top: Maybe Int, ...}
	this.dict;
	this.update = (entity,json) => {
		this.box = entity.userData.bbox();
			this.box.min.sub(json.level.position);
			this.box.max.sub(json.level.position);
			this.box.min.sub(json.level.position);
			this.box.max.sub(json.level.position);
		this.dict = box2map(
			this.box,
			json
		)
	}
}

export {
	position2map,
	position2grid,
	box2map,
	box2grid,
	box,
	Collision
}
