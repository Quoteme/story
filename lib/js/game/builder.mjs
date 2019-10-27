export {
	load
};

import * as MESHER from '../voxel-mesh/voxelMesh.mjs';
import * as CUTIMG from '../cutImg/cutImg.mjs';
import * as PATH from '../path/path.mjs';
import * as THREE from '../threejs/three.module.js';
//import * as math from '../mathjs/math.min.js';
//import * as MATH from '../mathjs/math.js';

// initTilesets :: JSON -> async JSON
const initTilesets = async r => (async r => Object.assign(
	r,
	{
		// iterate over all tilesets
		tilesets: await Promise.all(
			r.tilesets.map(async t => new Object({
				// keep the information that the .json files stores
				// about the tileset t
				...t,
				// append 'path', which tells where
				// the tileset image is stored exactly
				path: PATH.join(PATH.dirname(r.url),t.image),
				// load the tileset as an image into the 'img' object
				img: await asyncImageLoader(
					PATH.join(PATH.dirname(r.url),t.image)
				),
				// optionally load the extension .json tileset file
				// which stores information about which tiles are
				// arranged in which way on a voxel
				json: await fetch(
					PATH.join(
						PATH.dirname(r.url),
						t.image.replace(PATH.extname(t.image),'json'))
					)
					.then(r => r.json())
					.catch(r => {})
			}))
		)
	}
	))(r)
	.then(r => Object.assign(
		r,
		{
			// iterate over all tilesets
			tilesets: r.tilesets.map(t => Object.assign(t,{
				// add 'tile' object that stores all tiles from the tileset
				// as individual images
				tile: CUTIMG.split(t.img, t.tilewidth, t.tileheight)
					.flat()
				,
				// stores all available gids which are
				// available in this tileset
				domain: new Set(
					new Array(t.tilecount)
						.fill(0)
						.map((_,x) => t.firstgid+x)
				)
			})),
			// return the texture that fits to a tilegid
			// Int -> [Image]
			getTile: n =>{
				let tileset = r.tilesets.find(t => t.domain.has(n))
				return tileset.tile[n-tileset.firstgid]
			}
		}
	))

// add the categories 'vox' and 'flat' to the JSON
// initVoxels :: JSON -> JSON
const initVoxels = r => Object.assign(r,{
		vox:{
			vox: layersWithProperties(r.layers, 'vox')
				.map(l => layerToArray(l))
			,
			flat: layersWithProperties(r.layers, 'flat')
				.map(l => layerToArray(l))
		}
	})


// add the mesh category to the JSON
// initMeshes :: JSON -> JSON
const initMeshes = r => Object.assign(
	r,
	{
		mesh: voxIds(r.vox.vox)
			.filter(e => e!=0)
			.map(e => Object.assign(
				MESHER.voxToGeometry(
					r.vox.vox
						// transpose and rotate because of the
						// way tiled stores tilemaps
						.map(e => transpose(e).reverse())
						.map(x =>
							x.map(y =>
								y.map(z =>
									z==e)))
					,
					MESHER.culled
				),
				{gid: e}
			))
			.map(geometry => {
				let img = r.getTile(geometry.gid)
				let texture = new THREE.CanvasTexture(img);
				texture.magFilter = THREE.NearestFilter;
				// let texture = new THREE.TextureLoader().load(
				// 	'usr/res/grass.png'
				// );
				texture.wrapS = THREE.RepeatWrapping;
				texture.wrapT = THREE.RepeatWrapping;
				let material = new THREE.MeshLambertMaterial({
					//color: '#'+(Math.random()*0xFFFFFF<<0).toString(16),
					map: texture,
					wireframe: false,
					transparent: true
				});
				material.needsUpdate = true;
				let mesh = new THREE.Mesh(geometry,material);
					mesh.scale.set(10,10,10)
					//mesh.rotation.z = -Math.PI/2;
				return {
					mesh: mesh,
					geometry: geometry,
					material: material
				}
			})
	}
)

// all pairwise different entities in a [[[a]]] Array
// voxIds :: [[[Int]]] -> [Int]
const voxIds = vox => [...new Set(vox.flat(2))];

// [[a]] -> [[a]]
const transpose = arr => new Array(arr[0].length)
	.fill(0)
	.map((m,i) => new Array(arr.length)
		.fill(0)
		.map((n,j) => arr[j][i])
	)

// filter the layers with a specific property
// layersWithProperties :: [{a}] -> Strink -> [{a}]
const layersWithProperties = (layers, property) => layers
	.filter(l => l.properties
		.some(p => p.name == property))

// map a layer to a 2D array with each cell representing one voxel
// layerToArray :: {a} -> [Int]
const layerToArray = l => new Array(l.width)
	.fill(new Array(l.height)
		.fill(0)
	)
	.map((a,x) => a.map((b,y) => l
		.data[x+Math.floor(y*l.width)]))

// load :: URL -> async MAP
const load = async url => fetch(url)
	.then(r => r.json())
	.then(r => Object.assign(r,{url: url}))
	.then(async r => await initTilesets(r))
	.then(r => initVoxels(r))
	.then(r => initMeshes(r))

// asyncImageLoader :: URL -> async Image
function asyncImageLoader(url){
    return new Promise( (resolve, reject) => {
        var image = new Image()
        image.src = url
        image.onload = () => resolve(image)
        image.onerror = () => reject(new Error('could not load image'))
    })
}
