import * as COLLISION	from './collision.mjs';
import * as THREE		from '../threejs/three.module.js';

// physics that an entity needs
function Entity(obj){
	this.obj		= obj;
	this.velocity	= new THREE.Vector3(0,0,0);
	this.collision	= new COLLISION.Collision();
	this.gravity = _ => {
		if( this.collision.dict.bottom == 0 ||
			this.collision.dict.bottom == undefined
			){
				this.velocity.y-=0.5;
		}
		else{
			this.velocity.y = 0;
			// move slightly up, so the entity is not halfway stuck
			// inside the voxels
			this.obj.position.y+=0.05;
		}
	}
	this.actions	= {
		// jump :: Float -> (IO(), Float)
		jump : p => this.state.stand()
			? this.velocity.y += p
			: 0
		// walk :: [Float,Float] -> (IO(), Float)
		,run : (
				x,z,
				distribution = t => 2**(-((t-1.5)**2))
			) => {
				if( !this.state.run )
					return
				// let h = Math.hypot(this.velocity.x,this.velocity.z);
				// this.velocity.x += x*distribution(h);
				// this.velocity.z += z*distribution(h);
				this.velocity.x = x;
				this.velocity.z = z;
		}
	}
	this.state		= {
		mass		: 1
		,stand		: (_ => this.collision.dict.bottom != 0 &&
						this.collision.dict.bottom != undefined)
		,wallhang	: (_ => !this.state.stand && (
						this.collision.dict.left ||
						this.collision.dict.right ||
						this.collision.dict.front ||
						this.collision.dict.back
						))
		,jump		: _ => this.state.stand()
		,run		: _ => this.state.stand()
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
