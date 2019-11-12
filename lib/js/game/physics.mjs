import * as COLLISION	from './collision.mjs';
import * as THREE		from '../threejs/three.module.js';

function Entity(obj){
	this.obj = obj;
	this.mass = 1;
	this.velocity = new THREE.Vector3(0,-0.25,0);

	this.collision = (json) => {
		let b = new THREE
			.Box3()
			.setFromObject(this.obj)
		let c = COLLISION.box2map(
				b,
				json.vox.vox,
				json.block.size.toArray()
			)
		console.log(c.bottom)
		if (c.bottom!=0 || c.bottom==undefined)
			this.velocity.y = 0
	};
	this.move = (delta=1,blocksize) => this
		.obj
		.position
		.add( new THREE.Vector3(...this
			.velocity
			.toArray()
			.map((x,i) => x*blocksize[i])
			.map(x => x*delta)
		))
	this.update = (delta,json) => {
		this.collision(json);
		this.move(
			delta,
			json.block.size.toArray()
		);
	};
}



export {
	Entity
}
