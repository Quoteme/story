import * as COLLISION	from './collision.mjs';
import * as THREE		from '../threejs/three.module.js';

// physics that an entity needs
function Entity(obj){
	this.obj		= obj;
	this.velocity	= new THREE.Vector3(0,-0.15,0);
	this.collision	= new COLLISION.Collision();
	this.gravity = _ => {
		if( this.collision.dict.bottom == 0 ||
			this.collision.dict.bottom == undefined
			){
				this.velocity.y-=0.5;
				this.canJump = false;
		}
		else{
			this.velocity.y = 0;
			this.canJump = true;
			// move slightly up, so the entity is not halfway stuck
			// inside the voxels
			this.obj.position.y+=0.01;
		}
	}
	this.actions	= {
		// jump :: Float -> (IO(), Float)
		jump : p => this.canJump
			? this.velocity.y += p
			: 0
		// walk :: [Float,Float] -> (IO(), Float)
		,run : (
				angle,
				speed,
				distribution = t => 2**(-((t-1.5)**2))
			) => {
				let h = Math.hypot(this.velocity.x,this.velocity.z);
				this.velocity.x += Math.cos(angle)*speed*distribution(h);
				this.velocity.z += Math.sin(angle)*speed*distribution(h);
		}
	}
	this.state		= {
		mass	: 1
		,stand	: (_ => this.collision.dict.bottom != 0 &&
						this.collision.dict.bottom != undefined)
		,jump	: _ => this.state.stand()
		,run	: _ => this.state.stand()
	}
	this.move = (velocity,blocksize,delta=1) => this
		.obj
		.position
		.add( new THREE.Vector3(...velocity
			.toArray()
			.map((x,i) => x*blocksize[i])
			.map(x => x*delta)
		))
	this.update = (delta,json) => {
		this.collision.update(this.obj,json);
		this.gravity();
		this.actions.run(0,0.2)
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
