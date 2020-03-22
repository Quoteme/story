// builder.mjs
// load and build the voxelmap of a level made with tiled-mapeditor
//
// exports at the bottom

import * as MESHER from '../voxel-mesh/voxelMesh.mjs';
import * as CUTIMG from '../cutImg/cutImg.mjs';
import * as PATH from '../path/path.mjs';
import * as THREE from '../threejs/three.module.js';
//import * as math from '../mathjs/math.min.js';
//import * as MATH from '../mathjs/math.js';

// loads all the tilesets into the "tilesets" attribute
// of the json file
// initTilesets :: JSON -> async JSON
const initTilesets = async r => (async r => Object.assign(
	r,
	{
		// iterate over all tilesets
		tilesets: await Promise.all(
			r.tilesets.map(async t => {
				if(t.source!=undefined){
					t.url		= PATH.join(
									PATH.dirname(r.url),
									PATH.dirname(t.source)
								)
					t.source	= PATH.join(
									PATH.dirname(r.url),
									t.source
								)
					t = Object.assign(
						t,
						await fetch(t.source)
							.then(m => m.json())
					)
				}else{
					t.url		= PATH.dirname(r.url);
				}
				return new Object({
					// keep the information that the .json files stores
					// about the tileset t
					...t,
					// append 'path', which tells where
					// the tileset image is stored exactly
					path: PATH.join(t.url,t.image),
					// load the tileset as an image into the 'img' object
					img: await asyncImageLoader(
						PATH.join(t.url,t.image)
					),
				})
			})
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
			},
			getTileInfo: n =>{
				n--;
				// TODO: ERROR -  Cannot use tile id 0
				if(n==0)
					n++;
				// END TODO: ERROR -  Cannot use tile id 0
				let tileset = r.tilesets.find(t => t.domain.has(n))
				return tileset.tiles.find(e => e.id == n-(tileset.firstgid-1))
			}
		}
	))
	.then(r => {console.log(r); return r})

// add the categories 'vox' and 'flat' to the JSON
// initVoxels :: JSON -> JSON
const initVoxels = r => Object.assign(r,{
		vox:{
			vox: layersWithProperty(r.layers, 'vox')
				.map(l => layerToArray(l))
			,
			flat: layersWithProperty(r.layers, 'flat')
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
			// create a new geometry for each group of voxel
			.map(e => Object.assign(
				MESHER.multiMaterial(MESHER.voxToGeometry(
					r.vox.vox
						.map(x =>
							x.map(y =>
								y.map(z =>
									z==e)))
					,
					MESHER.greedy
				)),
				{gid: e}
			))
			// create a mesh for each geometry
			.map(geometry => {
				let materials = materialsFromProperty(r, geometry.gid)
				let material2 = new THREE.MeshBasicMaterial({
					color: '#'+(Math.random()*0xFFFFFF<<0).toString(16),
				})
				let mesh = new THREE.Mesh(geometry,materials);
					mesh.castShadow = true;
					mesh.receiveShadow = true;
				return {
					mesh: mesh,
					geometry: geometry,
					material: materials
				}
			})
	}
)

const materialsFromProperty = (
	r,
	id,
	Material = THREE.MeshLambertMaterial,
	materialSettings={
		transparent: true,
	},
	textureSettings=[
		undefined,
		THREE.RepeatWrapping,
		THREE.RepeatWrapping,
		THREE.NearestFilter,
		THREE.LinearMipMapLinearFilter
	]
) => {
	let tileinfo = r.getTileInfo(id);
	if(tileinfo != undefined)
		return ["right", "left", "top", "bottom", "back", "front"]
			.map(direction => new Material(
				Object.assign(
					{
						map: new THREE.CanvasTexture(
							r.getTile(
								tileinfo.properties
									.filter(e => e.name == direction)[0].value),
							...textureSettings
						),
					},
					materialSettings
				)
			))
		else
		return new Array(6)
			.fill(0)
			.map(e => new Material(
				Object.assign(
					{
						map: new THREE.CanvasTexture(
							r.getTile(id),
							...textureSettings
						),
					},
					materialSettings
				)
				)
			)
}

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
// layersWithProperty :: [{a}] -> Strink -> [{a}]
const layersWithProperty = (layers, property) => layers
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

// load all the tilesets into images,
// generate the voxel maps
// and generate the meshes for the voxels
// build :: JSON -> async JSON
const build = async json => await initTilesets(json)
	.then(r => initVoxels(r))
	.then(r => fixvoxels(r))
	.then(r => initMeshes(r))

// load a JSON file from a url and then build it
// load :: URL -> async MAP
const load = async url => fetch(url)
	.then(r => r.json())
	.then(r => Object.assign(r,{url: url}))
	.then(async r => await build(r))

// fix the strange way tiled handles map layers
const fixvoxels = r => {
	// transpose and rotate the voxel data
	// because of the tiled stores tilemap
	// data in a strange way
	r.vox.vox = r.vox.vox
		.map(e => transpose(e).reverse())
	r.vox.flat = r.vox.flat
		.map(e => transpose(e).reverse())
	return r;
}

// asyncImageLoader :: URL -> async Image
function asyncImageLoader(url){
    return new Promise( (resolve, reject) => {
        var image = new Image()
        image.src = url
        image.onload = () => resolve(image)
        image.onerror = () => reject(new Error('could not load image'))
    })
}

export {
	build,
	load,
	layersWithProperty
};
