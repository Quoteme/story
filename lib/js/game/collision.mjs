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
		? vox[v[0]][v[1]][v[2]]
		: undefined
}

// box2map :: THREE.Box3 -> [[[Int]]] -> [int] -> {
// 	top: Int, bottom: Int, left: Int, right: Int, front: Int, back: Int
// }
const box2map = (b,vox,blocksize) => {
	let d = box(b)
	return Object.assign(
		{},
		...Object.keys(d).map( k =>
			({[k]: position2map(
				new THREE.Vector3(...d[k]),
				vox,blocksize
			)})
		)
	)
}

// box :: THREE.Box3 -> {}
const box = (b) => ({
	top: [
		(b.min.x+b.min.x)/2,
		b.max.y,
		(b.min.z+b.min.z)/2,
	],
	bottom: [
		(b.min.x+b.min.x)/2,
		b.min.y,
		(b.min.z+b.min.z)/2,
	],
	left: [
		b.min.x,
		(b.min.y+b.min.y)/2,
		(b.min.z+b.min.z)/2,
	],
	right: [
		b.max.x,
		(b.min.y+b.min.y)/2,
		(b.min.z+b.min.z)/2,
	],
	front: [
		(b.min.x+b.min.x)/2,
		(b.min.y+b.min.y)/2,
		b.min.z,
	],
	back: [
		(b.min.x+b.min.x)/2,
		(b.min.y+b.min.y)/2,
		b.max.z,
	]
})

export {
	position2map,
	box2map
}
