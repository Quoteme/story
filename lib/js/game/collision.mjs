// Functions for checking if a thing intersects with
// the voxel map in any way

import * as INTERSECT from '../intersect/intersect.mjs';
import * as THREE		from '../threejs/three.module.js';

const position2map = (p,vox,blocksize) => {
	let v = p
		.toArray()
		.reverse()
		.map((x,i) => x/blocksize[i])
		.map(x => Math.floor(x))
	return INTERSECT.point2Array(v,vox)
		? vox
			[v[0]]
			[v[1]]
			[v[2]]
		: undefined
}

const position2grid = (p,blocksize) => p
	.map((x,i) => Math.floor(x/blocksize[i]))

// box2map :: THREE.Box3 -> [[[Int]]] -> [int] ->
const box2map = (b,vox,blocksize) => box2grid(box(b),blocksize)

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
			blocksize
		)})
	)
)

export {
	position2map,
	position2grid,
	box2map,
	box2grid,
	box
}
