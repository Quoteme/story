import * as COLLISION	from './collision.mjs';
import * as THREE		from '../threejs/three.module.js';

function Entity(obj){
	this.obj = obj;
	this.mass = 1;
	this.velocity = new THREE.Vector3(0,-0.15,0);

	this.collision = (json) => {
		let b = this.obj.userData.bbox();
			b.min.add(this.obj.position);
			b.max.add(this.obj.position);
			b.min.sub(new THREE.Vector3(0,0,2*json.block.size.z))
			b.max.sub(new THREE.Vector3(0,0,2*json.block.size.z))
		console.log(
			COLLISION.box2map(
				b,
				json.vox.vox,
				json.block.size.toArray()
			).bottom
		);
		// let c = COLLISION.box2map(
		// 		b,
		// 		json.vox.vox,
		// 		json.block.size.toArray()
		// 	)
		// if(c.bottom!=0 && c.bottom!=undefined)
		// 	console.error("reached");
		// if (c.bottom!=0){
		// 	this.velocity.y = 0;
		// 	// console.log(b,c)
		// }
		// else
		// 	this.velocity.y-= 0.05;
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
		// this.collision(json);
		this.move(
			delta,
			json.block.size.toArray()
		);
	};
}



export {
	Entity
}
