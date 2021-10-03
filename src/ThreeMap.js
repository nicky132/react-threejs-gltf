/**
 * React+Three.js DIY
 */
import './ThreeMap.css';
import React, { Component } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { RoughnessMipmapper } from 'three/examples/jsm/utils/RoughnessMipmapper';
import Stats from './common/threejslibs/stats.min.js';

class ThreeMap extends Component{
 	componentDidMount(){
		this.initThree();
	}
	initThree(){
		let stats;
		let camera, scene, renderer;
		let group;
		let container = document.getElementById('WebGL-output');
		let width = container.clientWidth,height = container.clientHeight;

		init();
		animate();

		function init() {
			console.log("init")
			renderer = new THREE.WebGLRenderer();
			scene = new THREE.Scene();
			group = new THREE.Group();
			scene.add( group );

			camera = new THREE.PerspectiveCamera( 60, width / height, 1, 2000 );
			camera.position.x = -10;
        	camera.position.y = 15;
			camera.position.z = 500;
			camera.lookAt( scene.position );
			
			//控制地球
			// let orbitControls = new /*THREE.OrbitControls*/Orbitcontrols(camera);
			let controls = new OrbitControls(camera, renderer.domElement);
			// this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        	controls.autoRotate = false;
        	// let clock = new THREE.Clock();
        	//光源
        	let ambi = new THREE.AmbientLight(0x686868);
        	scene.add(ambi);

        	let spotLight = new THREE.DirectionalLight(0xffffff);
        	spotLight.position.set(550, 100, 550);
        	spotLight.intensity = 0.6;

        	scene.add(spotLight);

			new RGBELoader()
				.setPath( 'textures/equirectangular/' )
				.load( 'royal_esplanade_1k.hdr', function ( texture ) {
				texture.mapping = THREE.EquirectangularReflectionMapping;
				scene.background = texture;
				scene.environment = texture;
				render();
				const roughnessMipmapper = new RoughnessMipmapper( renderer );
				const loader = new GLTFLoader();
				loader.load( 'demo3.gltf', function ( gltf ) {
					console.log("gltf")
					gltf.scene.traverse( function ( child ) {
						if ( child.isMesh ) {
							console.log("child")
							roughnessMipmapper.generateMipmaps( child.material );
						}
					} );
					scene.add( gltf.scene );
					roughnessMipmapper.dispose();
					render();
					renderer.render( scene, camera );
				} );
			})

			renderer.setClearColor( 0xffffff );
			renderer.setPixelRatio( window.devicePixelRatio );
			renderer.setSize( width, height );
			container.appendChild( renderer.domElement );
			stats = new Stats();
			container.appendChild( stats.dom );  //增加状态信息 

			controls.addEventListener( 'change', render); // use if there is no animation loop
			controls.minDistance = 2;
			controls.maxDistance = 10;
			controls.target.set( 0, 0, - 0.2 );
			controls.update();
			window.addEventListener( 'resize', onWindowResize );
		}
		function onWindowResize() {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize( window.innerWidth, window.innerHeight );
			render();
		}
		function animate() {
			requestAnimationFrame( animate );
			render();
			stats.update();
		}
		function render() {		
			group.rotation.y -= 0.005;  //这行可以控制地球自转
			renderer.render( scene, camera );
		}
	}
	render(){
		return(
			<div id='WebGL-output'></div>
		)
	}
}

export default ThreeMap;