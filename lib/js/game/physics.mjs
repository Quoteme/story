import * as COLLISION	from './collision.mjs';
import * as THREE		from '../threejs/three.module.js';

function Entity(obj){
	this.obj = obj;
	this.mass = 1;
	this.velocity = new THREE.Vector3(0,-0.15,0);

	this.collision = (json) => {
		let b = this.obj.userData.bbox();
			b.min.sub(json.level.position);
			b.max.sub(json.level.position);
			b.min.sub(json.level.position);
			b.max.sub(json.level.position);
		let c = COLLISION.box2map(
			b,
			json
		)
		if(c.bottom == 0)
			this.velocity.y-=0.5;
		else{
			this.velocity.y =10;
			this.velocity.x = 0.5-Math.random();
		}
		// if(c.bottom[1] <= 4)
		// 	this.velocity.y=0;
		// else
		// 	this.velocity.y-=0.05;
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
	this.move = (velocity,blocksize,delta=1) => this
		.obj
		.position
		.add( new THREE.Vector3(...velocity
			.toArray()
			.map((x,i) => x*blocksize[i])
			.map(x => x*delta)
		))
	this.update = (delta,json) => {
		this.collision(json);
		this.move(
			this.velocity,
			json.block.size.toArray(),
			delta
		);
	};
}



export {
	Entity
}
