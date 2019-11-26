// abstract super class for all input devices of the game

import * as KEYBOARD from '../keyboard/keyboard.mjs';

class InputDevice{
	constructor(entity){
		this.entity	= entity;
		this.keys = {
			menu		: undefined,
			pause		: undefined,
			move		: undefined,
			jump		: undefined,
			look		: undefined,
			action		: undefined,
			nextWeapon	: undefined,
			prevWeapon	: undefined,
		},
		this.check = {
			menu		: _ => {},
			pause		: _ => {},
			move		: _ => {},
			jump		: _ => {},
			look		: _ => {},
			action		: _ => {},
			nextWeapon	: _ => {},
			prevWeapon	: _ => {},
		}
	}
	menu(){
		console.log("menu");
	};
	pause(){
		console.log("pause");
	};
	move(x,z){
		this.entity.userData.physics.actions.run(x,z)
	};
	jump(){
		this.entity.userData.physics.actions.jump(15)
	};
	look(){};
	action(){};
	nextWeapon(){};
	prevWeapon(){};
	update(){
		if(this.check.menu())
			this.menu();
		if(this.check.pause())
			this.pause();
		if(this.check.move())
			this.move();
		if(this.check.jump())
			this.jump();
		if(this.check.look())
			this.look();
		if(this.check.action())
			this.action();
	}
}

class Keyboard extends InputDevice{
	constructor(entity){
		super(entity);
		this.keys = {
			menu:	"Escape",
			pause:	"p",
			move:	{
				back:	"w",
				front:	"s",
				left:	"a",
				right:	"d",
			},
			jump:	" ",
			look:	{
				up:		"ArrowUp",
				down:	"ArrowDown",
				left:	"ArrowLeft",
				right:	"ArrowRight",
			},
			action:		"f",
			nextWeapon:	"e",
			prevWeapon:	"q"
		}
		this.check = {
			menu:	_ => KEYBOARD.pressed(this.keys.menu),
			pause:	_ => KEYBOARD.pressed(this.keys.pause),
			move:	_ => Object
				.values(this.keys.move)
				.some(x => KEYBOARD.pressed(x)),
			jump:	_ => KEYBOARD.pressed(this.keys.jump),
			look:  _ => Object
				.values(this.keys.look)
				.some(x => KEYBOARD.pressed(x)),
			action:	_ => ( KEYBOARD.pressed(this.keys.action) ),
			nextWeapon:	_ => ( KEYBOARD.pressed(this.keys.nextWeapon) ),
			prevWeapon:	_ => ( KEYBOARD.pressed(this.keys.prevWeapon) )
		}
	}
	move(){
		let v = [
			KEYBOARD.pressed(this.keys.move.right)
				- KEYBOARD.pressed(this.keys.move.left),
			KEYBOARD.pressed(this.keys.move.back)
				- KEYBOARD.pressed(this.keys.move.front),
		]
		super.move(...v.map(x=>x*3))
	}
}

export{
	InputDevice,
	Keyboard
}
