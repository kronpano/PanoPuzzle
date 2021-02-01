		//to change to next level of panorama puzzle
		//set to one for the first run - will be overwritten by the saved settings 
		var whichPano = 1;
	
		// remember for reset
		var timeoutHandle;

		// for storing the results and overview list
		var levelTimes = "";

		// for getting the values back from local storage 
		var ReadMySettings = undefined;
 
		var timeNeeded = 0;
		// difficultu look up
		var difficultyLookup = ["","easy","normal","hard"];

		// to save/restore user settings

		// split MySettings one into 
		var UIsettings= {
			rotateDir : null,
			dragDir : null,
			hints : null,
			hintstimer: null,
			count : null,
			level : null
		} // this one should go into PuzzleUI and only be set AND saved when closeNav is being called

		var ConfigSettings={
			configs :[]
		} // this one keeps track of config changes and times for the puzzles
		
		POLYHEDRA = {
			Cube: {
				"name": "Cube",
				"vertex": [
					[-1, -1, -1],
					[1, -1, -1],
					[1, 1, -1],
					[-1, 1, -1],
					[1, -1, 1],
					[-1, -1, 1],
					[-1, 1, 1],
					[1, 1, 1]
				],
				"edge": [
					[0, 1],
					[1, 2],
					[2, 3],
					[3, 0],
					[1, 4],
					[4, 7],
					[7, 2],
					[4, 5],
					[5, 6],
					[6, 7],
					[5, 0],
					[3, 6]
				],
				"face": [
					[0, 1, 2, 3],
					[1, 4, 7, 2],
					[4, 5, 6, 7],
					[5, 0, 3, 6],
					[5, 4, 1, 0],
					[3, 2, 7, 6]
				],
				"size": [1, 1, 1, 1, 1, 1],
				"offset": [[0,0], [0,0], [0,0], [0,0], [0,0], [0,0]]
				}
			
			// cube is now defined in a way that UV mapping always goes 0,0-1,0-1,1 and 0,0-1,1-0,1 
			// order of faces is front,right,back,left,bottom,top

			// all the faces are defined anticlockwise starting at bottom left corner
			// top and bottom as well - you need to turn the cube to look onto them

			// size contains the information on how often a certain face has been subdivided which feeds into the size info for UV mapping
			// offset is needed for the UV mapping once a face has been subdivided at least once
			}

		// standard global variables
		var container, scene, camera, renderer, controls, light;

		var showAllText;

		var data;
		// set mouse to top left corner so raycast doesn't immediately pick something up
		var mouse = new THREE.Vector2(-1, 1);

		var INTERSECTED = null;
		raycaster = new THREE.Raycaster();
		
		// direction vector for zooming
		var dir = new THREE.Vector3;

		var rightClick = false;
		var startTime = 0;

		// for touch events 
		var touchTime;

		// for textures
		var materials = [];
		var tile_connect = [];

		// lights
		var lightsOut = false;

		// to load levels
		var face_materials = [];

		// general size
		var polysize = 100;
		
		//
		//  That's where it starts
		//

		// setting the scene, lights and basic stuff
		init();
		
		//check if the configuration file has changed
		checkConfigChange();

		read_UI_values();

		//check URL if it contains a request for a certain tour or panorama
		var sharelinkOK = checkURL();

		// set the text of the initial PopUp Info Tab
		document.getElementById("info").innerHTML = PP.InfoLinks.info;
		document.getElementById("currentlyPlaying").innerHTML=PP_config[whichConfig][0][1];
		if(!sharelinkOK){
			document.getElementById("instruction").innerHTML = "Shared link puzzle has been removed - play a random one";		
		}
		// display the current subdivided cube and put it into the scene
		startGame();

		//playing the puzzle
		animate();

		//
		// That's where it ends
		//


		// FUNCTIONS 
		function startGame(){
			// this starts it all - when the scene is ready 
			if(scene.ready){
				lightsOut = false;
				light.intensity = 2;		
				document.getElementById("status").style.visibility = "visible";
				scene.data=null; // remove data stored in scene for next level
				let data = JSON.parse(JSON.stringify(POLYHEDRA.Cube)); // need to create a deep copy of my original Cube object so I can reset it for the next level.
				displayPolyhedron(data,howDifficult);
			}

		}
		
		function init() {
			// SCENE
			scene = new THREE.Scene();
			scene.selectable = []; // used for raycast

			// RENDERER
			renderer = new THREE.WebGLRenderer({
				antialias: true
			});
			renderer.setPixelRatio(window.devicePixelRatio);
			renderer.setSize(window.innerWidth, window.innerHeight);

			container = document.getElementById('ThreeJS');
			container.appendChild(renderer.domElement);

			// CAMERA
			camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 2000);			
			// OrbitControls overrides lookAt
			controls = new THREE.PuzzleControls(camera, renderer.domElement);	
			// so set camera initial position using controls.position and target
			controls.object.position.set(0,0.002,0);
			controls.target = new THREE.Vector3(0,0.5,0);
		
			// for FOV zooming to minimise the distortion
			controls.FOVzoom = true;
			controls.minFOV = 12;
			controls.maxFOV = 35;
			controls.zoomFactor = 0.015; // speed of the FOV zoom
			controls.zoomSpeed = 0.5; // speed of movement zoom for outside view zoom
			controls.enableZoom = true;	// disables position zoom - needed for inside view which is the initial one.


			// EVENTS		
			ThreeJS.addEventListener('mousemove', onMouseMove, false);
			ThreeJS.addEventListener('mousedown', onTouchDown, false);
			ThreeJS.addEventListener('mouseup', onTouchUp, false);
			
			ThreeJS.addEventListener('touchstart', onTouchDown, false);
			ThreeJS.addEventListener('touchend', onTouchUp, false);
						
			window.addEventListener('resize', onWindowResize, false);
			
			// LIGHT
			light = new THREE.PointLight(0xffffff, 2, 0);
			light.position.copy(camera.position);
			scene.add(light);

			////////////
			// Start  //
			////////////

			
			this.cubeMesh = new THREE.Object3D();
			scene.add(cubeMesh);
			scene["ready"] = true;
			//data = JSON.parse(JSON.stringify(POLYHEDRA.Cube)); // need to create a deep copy of my original Cube object so I can reset it for the next level.
			//displayPolyhedron(data,true,2);

			timoutHandle = setTimeout(function() {
				document.getElementById("info").style.visibility = "hidden";
				//document.getElementById("InfoIcon").style.visibility = "visible";
				document.getElementById("cogIcon").style.visibility = "visible";
			}, infoTime);        

		} // end of function init()


		///////////////////////////////
		function getPanoTileMaterialConnect(whichPano)
		{
			
			var tileMaterial = [];
            var tileConnect = [];


			// Make it possible to use <filename>_front.jpg or a regular expression which checks for front/right in the back
			pano_sub2_tiles=[	
			"front.jpg", 
			"right.jpg",
			"back.jpg",
			"left.jpg", 
			"bottom.jpg", 
			"top.jpg"
			]


			for (var i=0; i < (6); i++){
				var filename = "images/"+PP_config[whichConfig][whichPano][4]+"/" + pano_sub2_tiles[i];
				tileMaterial[i] = new THREE.MeshBasicMaterial( {
					map: new THREE.TextureLoader().load(filename), 
					name: filename,
					transparent: true, 
					opacity: 0.99,
					side: THREE.DoubleSide
				} );
                // rotation will +/-1 and connect will check if mod(4) is 0  -- only dealing with squares here
                tileConnect[i] = 0;                             
			}	

			return [tileMaterial,tileConnect];
		}	

		// for random face selection
		function shuffle(array) {
		  var currentIndex = array.length, temporaryValue, randomIndex;

		  // While there remain elements to shuffle...
		  while (0 !== currentIndex) {

			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		  }

		  return array;
		}
		//////////
		
		
		function displayPolyhedron(data,difficulty) {
			scene.remove(cubeMesh);
			for (var i = 0; i < scene.selectable.length; i++) {
				scene.remove(scene.selectable[i]);
			}
			//console.log(whichPano,data);
			
            var texCon = getPanoTileMaterialConnect(whichPano);

			materials = texCon[0];
			tile_connect = texCon[1];

			cubeMesh = cubeDataToMesh(data);
			cubeMesh.name = "poly";

			shuffleTiles(difficulty); // is done from the user interface
			
			// order is important here because check also manipulates the hintstart
			// this is so in a new level you need to click first before the hints kick in
			hintstart=0;
			startTime=0;
			
			scene.add(cubeMesh);
			saveLevelFinishTime(whichConfig, whichPano, 0)
		}
		
		function shuffleTiles(difficulty){
			var toRotate = [];
			//create an array with all the numbers until face.length
			for (var k=0; k < scene.data.face.length; k++){
				toRotate.push(k);
			}
			// shuffle it
			toRotate = shuffle(toRotate)
			
			var percentRotate
			//console.log("difficulty ", difficulty)
			if (difficulty == 1){percentRotate = panoShuffleEasy;}
			if (difficulty == 2){percentRotate = PP_config[whichConfig][whichPano][2];}
			if (difficulty == 3){percentRotate = panoShuffleHard;}
			// do the rotate over a loop from 0 to Math.ceil(face.length* scramble/100)
			for (var k=0; k < Math.ceil(scene.data.face.length* percentRotate/100); k++){
				for (var i=0; i < getRandom(1,3); i++){
					rotate(scene.selectable[toRotate[k]],false);
				}
			}		
		    checkPanoConnect();
						
		}

		// create polyhedron from data - faces are separate selectable objects 
		function cubeDataToMesh(data) {

			connect = [];

			var polyhedron = new THREE.Object3D();

			// convert vertex data to THREE.js vectors
			var vertex = []
			for (var i = 0; i < data.vertex.length; i++)
				vertex.push(new THREE.Vector3(data.vertex[i][0], data.vertex[i][1], data.vertex[i][2]).multiplyScalar(polysize));

			// uv coordinates for the 6 original faces - the two triangles - first three values are one triangle the second three are the other
			var uv = [0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1];

			// create an uv array for all faces
			var faceUV = [];
			for (var faceNum = 0; faceNum < data.face.length; faceNum++) {
				faceUV[faceNum] = uv;
			}
		
			// handling of face subdivision is not the easiest to deal with
			// a face that is subdivided is taken out of the list and the new faces are appended
			// that means subdividing face 0 4 times divides all the sides around but leaves top/bottom untouched
			subdividePattern(PP_config[whichConfig][whichPano][1],data, vertex, faceUV);
			
			/*		
				// creates spheres on the corners - not really needed
				var vertexGeometry = new THREE.SphereGeometry( 0.5, 4, 4 );
				var vertexMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff} );
				var vertexSingleMesh = new THREE.Mesh( vertexGeometry );

				var vertexPoints = new THREE.Geometry();
				for (var i = 0; i < vertex.length; i++)
				{
					var vMesh = vertexSingleMesh.clone();
					vMesh.position.copy(vertex[i]);
					//vMesh.position.multiplyScalar(0.9975);
					vertexPoints.mergeMesh(vMesh);
				}
				var vertexMesh = new THREE.Mesh( vertexPoints, vertexMaterial );
				vertexMesh.name="vertexMesh";
				polyhedron.add( vertexMesh );
			*/
			
			// create an edge mesh of cylinders
			var edgeMaterial = new THREE.MeshLambertMaterial({
				color: PP_config[whichConfig][whichPano][3],
				transparent: false
			});
			var edgeLines = new THREE.Geometry();
			for (var i = 0; i < data.edge.length; i++) {
				var index0 = data.edge[i][0];
				var index1 = data.edge[i][1];
				var eMesh = cylinderMesh(vertex[index0], vertex[index1], edgeMaterial);
				edgeLines.mergeMesh(eMesh);
			}
			var edgeMesh = new THREE.Mesh(edgeLines, edgeMaterial);
			edgeMesh.name = "edgeMesh";
			polyhedron.add(edgeMesh);
			// end of edge mesh


			// convert face data to a single (triangulated) geometry

			var faceMaterials = [];

			scene.selectable = [];
			//console.log("No. of faces: " + data.face.length);
			document.getElementById("status").innerHTML = "Pieces: " + data.face.length;

			for (var faceNum = 0; faceNum < data.face.length; faceNum++) {
				// new geometry for each face
				var geometry = new THREE.Geometry();
				var faceIndex = 0;
				var numVertices = data.face[faceNum].length;

				// calculate centers
				var sumvec = new THREE.Vector3();
				for (var i = 0; i < numVertices; i++) {
					sumvec.add(vertex[data.face[faceNum][i]]);
					// vertices array for this face
					geometry.vertices.push(vertex[data.face[faceNum][i]])
				}
				sumvec.divideScalar(numVertices);
				// save center point in geometry mesh for rotation
				geometry.centerPoint = sumvec;
				//console.log(sumvec)

				// fill faces
				for (var i = 0; i < data.face[faceNum].length - 2; i++) {
					geometry.faces[faceIndex] = new THREE.Face3(0, i + 1, i + 2);
					geometry.faceVertexUvs[0].push([new THREE.Vector2(faceUV[faceNum][0], faceUV[faceNum][1]),
						new THREE.Vector2(faceUV[faceNum][2], faceUV[faceNum][3]),
						new THREE.Vector2(faceUV[faceNum][4], faceUV[faceNum][5])
					]);
					geometry.faceVertexUvs[0].push([new THREE.Vector2(faceUV[faceNum][6], faceUV[faceNum][7]),
						new THREE.Vector2(faceUV[faceNum][8], faceUV[faceNum][9]),
						new THREE.Vector2(faceUV[faceNum][10], faceUV[faceNum][11])
					]);
					faceIndex++;

				}

				geometry.computeFaceNormals();
				geometry.computeVertexNormals();

				if (typeof materials[faceNum] != "undefined") {
					faceMaterials[faceNum] = materials[faceNum].clone();
					connect[faceNum] = tile_connect[faceNum];
				}


				////////// End of material assignment -- needs to get out of here			


				mesh = new THREE.Mesh(geometry, faceMaterials[faceNum]);
				mesh.name = "faceMesh_" + faceNum;
				mesh.faceNum = faceNum;
				//mesh.scale.multiplyScalar(1.01);
				scene.add(mesh);
				scene.selectable.push(mesh);

			}
			//console.log("connect",connect);
			// not sure this is the way to go - stored my data which is needed for rotate in the scene ????
			scene["data"] = data;

			return polyhedron;
		}

		function cylinderMesh(point1, point2, material) {
			var direction = new THREE.Vector3().subVectors(point2, point1);
			var arrow = new THREE.ArrowHelper(direction.clone().normalize(), point1);
			var edgeGeometry = new THREE.CylinderGeometry(0.2, 0.2, direction.length(), 8, 1);
			var edge = new THREE.Mesh(edgeGeometry, material);
			edge.position.copy(new THREE.Vector3().addVectors(point1, direction.multiplyScalar(0.5)));
			edge.rotation.setFromVector3(new THREE.Euler().setFromQuaternion(arrow.quaternion));
			return edge;

		}
		
		function subdividePattern(whichPattern,data, vertex, faceUV){
			switch (whichPattern) {
				case 1:
					// 44 pieces
					// sides around 9s top/bottom 4s
					for (s = 0; s < 4; s++) { 
						subthreedivideFace(0, data, vertex, faceUV);
					}				
					subdivideFace(0, data, vertex, faceUV);
					subdivideFace(0, data, vertex, faceUV);
					break;
				case 2:
					// 54 pieces
					// all sides in 9s
					for (s = 0; s < 6; s++) { 
						subthreedivideFace(0, data, vertex, faceUV);
					}					
					break;
				case 3:
					// 58 pieces
					// top bottom 9s
					subthreedivideFace(4, data, vertex, faceUV);
					subthreedivideFace(4, data, vertex, faceUV);
					// around 4s
					for (s = 0; s < 4; s++) { 
						subdivideFace(0, data, vertex, faceUV);
					}
					// subdivide every second side around again
					for (s = 18; s <=25; s++) {
						subdivideFace(s, data, vertex, faceUV);
					}	
					break;
				case 4:
					// 66 pieces
					// all sides 9s
					for(s=0;s<6;s++){  
						subthreedivideFace(0,data,vertex,faceUV);
					}		
					// middle ones of sides again in 4
					for (s=4;s<30;s+=8){
						subdivideFace(s, data, vertex, faceUV);				
					}
					break;
				case 5:
					// 68 pieces
					// top bottom 9s
					subthreedivideFace(4, data, vertex, faceUV);
					subthreedivideFace(4, data, vertex, faceUV);
					// 2 sides 4s
					for (s = 0; s < 2; s++) { 
						subdivideFace(s, data, vertex, faceUV);
					}
					// other two sides 9s
					for (s = 0; s <2; s++) {
						subthreedivideFace(0, data, vertex, faceUV);
					}
					// divide the 2 sides of 4s again
					for (s = 18; s < 26; s++) { 
						subdivideFace(18, data, vertex, faceUV);
					}
					break					
				case 6:
					// 72 pieces
					// sub top/bottom once - sides of cube twice -  6 for the first subdivsion and then 16 for the second one 
					for (s = 0; s < 6+( 4 * 4); s++) { 
						subdivideFace(0, data, vertex, faceUV);
					}					
					break;
				case 7:
					// 80 pieces
					// all around 9s
					for(s=0;s<4;s++){  
						subthreedivideFace(0,data,vertex,faceUV); // sides in 9
					}	
					subdivideFace(0,data,vertex,faceUV); // top and bottom into 4
					subdivideFace(0,data,vertex,faceUV);
					// middle ones of sides again in 4
					for (s=3;s<26;s+=6){
						subdivideFace(s, data, vertex, faceUV);				
						subdivideFace(s, data, vertex, faceUV);				
						subdivideFace(s, data, vertex, faceUV);				
					}					
					break;
				case 8:
					// 82 pieces
					// all around 4s
					for(s=0;s<4;s++){  
						subdivideFace(0,data,vertex,faceUV);
					}
					// top bottom 9s
					subthreedivideFace(0, data, vertex, faceUV);
					subthreedivideFace(0, data, vertex, faceUV);
					// all around each face 4s again
					for(s=0;s<(4*4);s++){  
						subdivideFace(0,data,vertex,faceUV);
					}
					break;
				case 9:	
					// 90 pieces
					// all sides 9s
					for(s=0;s<6;s++){  
						subthreedivideFace(0,data,vertex,faceUV);
					}	
					// diagonals again ---- too much!!
					subdivideFace(0, data, vertex, faceUV);	
					subdivideFace(3, data, vertex, faceUV);	
					subdivideFace(6, data, vertex, faceUV);	
					subdivideFace(6, data, vertex, faceUV);	
					subdivideFace(9, data, vertex, faceUV);	
					subdivideFace(12, data, vertex, faceUV);
					subdivideFace(12, data, vertex, faceUV);	
					subdivideFace(15, data, vertex, faceUV);	
					subdivideFace(18, data, vertex, faceUV);
					subdivideFace(18, data, vertex, faceUV);	
					subdivideFace(21, data, vertex, faceUV);	
					subdivideFace(24, data, vertex, faceUV);									
					break;					
				case 10:
					// 96 pieces		
					// sub whole cube twice 6 for the first subdivsion and then 24 for the second one
					for(s=0;s<(6+6*4);s++){  
						subdivideFace(0,data,vertex,faceUV);
					}						
					break;
				case 11:
					// 122 pieces
					// all around 4s
					for(s=0;s<4;s++){  
						subdivideFace(0,data,vertex,faceUV);
					}
					// top bottom 9s
					subthreedivideFace(0, data, vertex, faceUV);
					subthreedivideFace(0, data, vertex, faceUV);
					// all around each face 4s again
					for(s=0;s<8;s++){  
						subdivideFace(s,data,vertex,faceUV);
					}
					// all around the rest 9s again
					for(s=0;s<8;s++){  
						subthreedivideFace(0,data,vertex,faceUV);
					}
					break;
				case 12:
					// 124 pieces
					// all sides in 4
					for (s = 0; s < 6; s++) { 
						subdivideFace(0, data, vertex, faceUV);
					}
					// diagonals another 4
					for (s = 0; s < 12; s++) { 
						subdivideFace(s, data, vertex, faceUV);				
					}
					// the others (excepts floor/sky) in 9s
					for (s = 0; s < 8; s++) { 
						subthreedivideFace(0, data, vertex, faceUV);				
					}						
					break;
				case 13:
					// 132 pieces
					// all in 9s
					for(s=0;s<6;s++){  
						subthreedivideFace(0,data,vertex,faceUV);
					}
					// some of them in 4s again
					for(s=0;s<26;s++){  
						subdivideFace(s,data,vertex,faceUV); // 4 divide in 5/4 patttern
					}				
					break;
			}
			return
		}

		function subdivideFace(face2sub, data, vertex, faceUV) {

			var siz = data.size.splice(face2sub, 1); // take out of size array
			var offsetXY = data.offset.splice(face2sub, 1); // take out of offset array
			var face4sub = data.face.splice(face2sub, 1); // take the face
			var mat4UV = materials.splice(face2sub, 1); // the material
			var face4UV = faceUV.splice(face2sub, 1); // and the UV out of the arrays
			// tiling all sides once requires to do a subdivideface(0....) several times.


			face4sub[0].push(face4sub[0][0]); // push 0 element on so I have 4 mid points to calculate - circular - 5 values - 4 differences;
			var mid = new THREE.Vector3();
			for (var i = 0; i < 4; i++) {
				//console.log(vertex[face4sub[0][i]]);

				// create the middle points of the sides
				var dir = new THREE.Vector3();				
				dir.lerpVectors(vertex[face4sub[0][i]], vertex[face4sub[0][i+1]],0.5);
				// lerpVectors can be used instead of subVectors, divide and then add to the staring point
				// this means I can just use lerpVectors with 1/3 and 2/3 to get the points of the sides
				// Then I need to get the mid points in the same way
				//
				// go down the newly created 2 vectors and lerpvector them to the other side
				//
				//	x--3--x
				//	|     |
				//	4--m--2
				//	|     |
				//	x--1--x
						
				mid.add(vertex[face4sub[0][i]]);
				vertex.push(dir.clone());
				data.vertex.push(dir.divideScalar(polysize).toArray());
			}
			// need middle point as well for the divide by 2 or 4 - 
			
			mid.divideScalar(4);
			vertex.push(mid.clone());
			//console.log(mid);
			data.vertex.push(mid.divideScalar(polysize).toArray());
			// now last thing on vertex are the 4 new points and the middle

			// .....,mid_1,mid_2,mid_3,mid_4,middle]

			// push new lines on edge
			data.edge.push([vertex.length - 5, vertex.length - 3]);
			data.edge.push([vertex.length - 4, vertex.length - 2]);

			// push new faces onto faces
			data.face.push([face4sub[0][0], vertex.length - 5, vertex.length - 1, vertex.length - 2]);
			data.face.push([vertex.length - 5, face4sub[0][1], vertex.length - 4, vertex.length - 1]);
			data.face.push([vertex.length - 1, vertex.length - 4, face4sub[0][2], vertex.length - 3]);
			data.face.push([vertex.length - 2, vertex.length - 1, vertex.length - 3, face4sub[0][3]]);


			var x = offsetXY[0][0];
			var y = offsetXY[0][1];

			faceUV.push([	0+x			, 0+y		, 0.5*siz + x, 
							0+y			, 0.5*siz+x	, 0.5*siz + y, 
							0+x			, 0+y		, 0.5*siz + x, 
							0.5*siz + y	, 0+x		, 0.5*siz + y])
			faceUV.push([	0.5*siz + x	, 0+y		, 1*siz + x, 
							0+y			, 1*siz + x	, 0.5*siz + y, 
							0.5 *siz + x, 0+y		, 1*siz + x, 
							0.5*siz + y	, 0.5*siz+x	, 0.5*siz + y])
			faceUV.push([	0.5*siz + x	, 0.5*siz+y	, 1*siz + x,
							0.5*siz + y	, 1*siz+x	, 1*siz + y,
							0.5*siz + x	, 0.5*siz+y	, 1*siz + x,
							1*siz + y	, 0.5*siz+x	, 1*siz + y])
			faceUV.push([	0+x			, 0.5*siz+y , 0.5*siz + x, 
							0.5*siz + y	, 0.5*siz+x	, 1*siz + y, 
							0+ x		, 0.5*siz+y	, 0.5*siz + x, 
							1*siz + y	, 0+ x		, 1*siz + y])
			

			
			// looks up the UV shift for basic 4 division 
			var offsets = [
				[0, 0],
				[0.5, 0],
				[0.5, 0.5],
				[0, 0.5]
			];
			
			for (var k = 0; k < 4; k++) {
				materials.push(mat4UV[0]); // get materials on
				tile_connect.push(0); // and connect data
				data.size.push(siz/2); // push size info for this frame
				data.offset.push([x+offsets[k][0]*siz,y+offsets[k][1]*siz]); // add and push offset info for this face
			}

			return;

		}

		function subthreedivideFace(face2sub, data, vertex, faceUV) {

			var siz = data.size.splice(face2sub, 1); // take out of size array
			var offsetXY = data.offset.splice(face2sub, 1); // take out of offset array
			var face4sub = data.face.splice(face2sub, 1); // take the face
			var mat4UV = materials.splice(face2sub, 1); // the material
			var face4UV = faceUV.splice(face2sub, 1); // and the UV out of the arrays
			// yes, the taking out makes the tile count OK but messes with side count
			// tiling all sides one requires to do a subdivideface(0....) several times.


			face4sub[0].push(face4sub[0][0]); // push 0 element on so I have 4 mid points to calculate - circular - 5 values - 4 differences;
			var mid = new THREE.Vector3();
			for (var i = 0; i < 4; i++) {
				var third = new THREE.Vector3();
				var twothird = new THREE.Vector3();
				third.lerpVectors(vertex[face4sub[0][i]], vertex[face4sub[0][i+1]],(1/3));
				twothird.lerpVectors(vertex[face4sub[0][i]], vertex[face4sub[0][i+1]],(2/3));
				// lerpVectors can be used instead of subVectors, divide and then add to the staring point
				// this means I can just use lerpVectors with 1/3 and 2/3 to get the points of the sides
				// Then I need to get the mid points in the same way
				//
				// go down the newly created 2 vectors and lerpvector them to the other side

				
				//	x--6--5--x
				//	|        |
				//	7--10-12-4
				//	|        |
				//	8--9--11-3
				//	|        |
				//	x--1--2--x
				
				
				vertex.push(third.clone());
				vertex.push(twothird.clone());
				data.vertex.push(third.divideScalar(polysize).toArray());
				data.vertex.push(twothird.divideScalar(polysize).toArray());
			}


			// .....,third_1,twothird_2,third_3,twothird_4,third_5,twothird_6,third_7,twothird_8]

			// push new lines on edge
			data.edge.push([vertex.length - 8, vertex.length - 3]); // edge 1-6
			data.edge.push([vertex.length - 7, vertex.length - 4]); // edge 2-5
			
			data.edge.push([vertex.length - 6, vertex.length - 1]); // edge 3-8
			data.edge.push([vertex.length - 5, vertex.length - 2]); // edge 4-7

			// for faces I need 9-12 as well which can come from 1-6 and 2-5
			var third = new THREE.Vector3();
			var twothird = new THREE.Vector3();
			
			// from 7-4
			third.lerpVectors(vertex[vertex.length - 2], vertex[vertex.length - 5],(1/3));
			twothird.lerpVectors(vertex[vertex.length - 2], vertex[vertex.length - 5],(2/3));
			
			var aathird = new THREE.Vector3();
			var aatwothird = new THREE.Vector3();
			// from 8-3
			aathird.lerpVectors(vertex[vertex.length - 1], vertex[vertex.length - 6],(1/3));
			aatwothird.lerpVectors(vertex[vertex.length - 1], vertex[vertex.length - 6],(2/3));			
			
			
			vertex.push(third.clone());
			vertex.push(twothird.clone());
			data.vertex.push(third.divideScalar(polysize).toArray());
			data.vertex.push(twothird.divideScalar(polysize).toArray());
			

			vertex.push(aathird.clone());
			vertex.push(aatwothird.clone());
			data.vertex.push(aathird.divideScalar(polysize).toArray());
			data.vertex.push(aatwothird.divideScalar(polysize).toArray());
			// new vertices now pushed on as 9,10,11,12
			
				//	x--6--5--x
				//	|        |
				//	7--9--10-4
				//	|        |
				//	8--11-12-3
				//	|        |
				//	x--1--2--x
			
			// .....,new_1,new_2,new_3,new_4,new_5,new_6,new_7,new_8,new_9,new_10,new_11,new_12]
			// .....,  -12,  -11,  -10,   -9,   -8,   -7,   -6,   -5,   -4,    -3,    -2, len-1]
			
			// push new faces onto faces
			//lower row
			data.face.push([face4sub[0][0], vertex.length - 12, vertex.length - 2, vertex.length - 5]); // lower left -1-11-8
			data.face.push([vertex.length -12, vertex.length - 11, vertex.length - 1, vertex.length - 2]); // 1-2-12-11
			data.face.push([vertex.length - 11, face4sub[0][1], vertex.length - 10, vertex.length - 1]); // 2-lower right-3-12
			
			// middle row
			data.face.push([vertex.length - 5, vertex.length - 2, vertex.length - 4, vertex.length - 6]); // 8-11--9-7
			data.face.push([vertex.length - 2, vertex.length - 1, vertex.length - 3, vertex.length - 4]); // 11-12-10-9
			data.face.push([vertex.length - 1, vertex.length -10, vertex.length - 9, vertex.length - 3]); // 12-3-4-10
			
			// top row
			data.face.push([vertex.length - 6, vertex.length - 4, vertex.length - 7,face4sub[0][3]]); // 7-9-6-topleft
			data.face.push([vertex.length - 4, vertex.length - 3, vertex.length - 8,vertex.length - 7]); // 9-10-5-6
			data.face.push([vertex.length - 3, vertex.length - 9, face4sub[0][2]   ,vertex.length - 8]); // 10-4-topright-5		


			var x = offsetXY[0][0];
			var y = offsetXY[0][1];

						// lower row
			faceUV.push([  0*siz+x, 0*siz+y, 1/3*siz+x, 0*siz+y, 1/3*siz+x, 1/3*siz+y,   0*siz+x, 0*siz+y, 1/3*siz+x, 1/3*siz+y,   0*siz+x, 1/3*siz+y])
			faceUV.push([1/3*siz+x, 0*siz+y, 2/3*siz+x, 0*siz+y, 2/3*siz+x, 1/3*siz+y, 1/3*siz+x, 0*siz+y, 2/3*siz+x, 1/3*siz+y, 1/3*siz+x, 1/3*siz+y])
			faceUV.push([2/3*siz+x, 0*siz+y,   1*siz+x, 0*siz+y,   1*siz+x, 1/3*siz+y, 2/3*siz+x, 0*siz+y,   1*siz+x, 1/3*siz+y, 2/3*siz+x, 1/3*siz+y])

			//middle row
			faceUV.push([  0*siz+x, 1/3*siz+y, 1/3*siz+x, 1/3*siz+y, 1/3*siz+x, 2/3*siz+y, 0  *siz+x, 1/3*siz+y, 1/3*siz+x, 2/3*siz+y, 0 *siz+x,  2/3*siz+y])
			faceUV.push([1/3*siz+x, 1/3*siz+y, 2/3*siz+x, 1/3*siz+y, 2/3*siz+x, 2/3*siz+y, 1/3*siz+x, 1/3*siz+y, 2/3*siz+x, 2/3*siz+y, 1/3*siz+x, 2/3*siz+y])
			faceUV.push([2/3*siz+x, 1/3*siz+y, 1  *siz+x, 1/3*siz+y, 1  *siz+x, 2/3*siz+y, 2/3*siz+x, 1/3*siz+y, 1  *siz+x, 2/3*siz+y, 2/3*siz+x, 2/3*siz+y])
                                                 
			// top row                           
			faceUV.push([  0*siz+x, 2/3*siz+y, 1/3*siz+x, 2/3*siz+y, 1/3*siz+x, 1*siz+y, 0  *siz+x, 2/3*siz+y, 1/3*siz+x, 1*siz+y, 0  *siz+x, 1*siz+y])
			faceUV.push([1/3*siz+x, 2/3*siz+y, 2/3*siz+x, 2/3*siz+y, 2/3*siz+x, 1*siz+y, 1/3*siz+x, 2/3*siz+y, 2/3*siz+x, 1*siz+y, 1/3*siz+x, 1*siz+y])
			faceUV.push([2/3*siz+x, 2/3*siz+y, 1  *siz+x, 2/3*siz+y, 1  *siz+x, 1*siz+y, 2/3*siz+x, 2/3*siz+y, 1  *siz+x, 1*siz+y, 2/3*siz+x, 1*siz+y])	
			
			// looks up the UV shift for basic 9 division 
			var offsets = [
				[0, 0],
				[1/3, 0],
				[2/3, 0],
				[0, 1/3],
				[1/3, 1/3],
				[2/3, 1/3],
				[0, 2/3],
				[1/3, 2/3],
				[2/3, 2/3],
			];
			
			for (var k = 0; k < 9; k++) {
				materials.push(mat4UV[0]); // get materials on
				tile_connect.push(0); // and connect data
				data.size.push(siz/3); // push size info for this frame
				data.offset.push([x+offsets[k][0]*siz,y+offsets[k][1]*siz]); // add and push offset info for this face
			}

			return;

		}
		
		function getRandom(min, max) {
			return Math.floor(Math.random() * (1 + max - min)) + min;
		}


		// just need to check if the connect value modulo 4 is 0 

		function checkPanoConnect() {
			var connectedFaces = []; // start with face 0
			var currentLevel = []; // for saving the current level
			for (var k = 0; k < scene.data.face.length; k++) {
				currentLevel.push(connect[k]);
				if ((connect[k]%4) == 0) { 
					connectedFaces.push(k);	
					// reset timer for hints 
					hintstart = new Date();
					// start timer when "last" puzzle piece was found	
				}
			}
			
			// use that to save "in level" state???
			//scene["current"]=currentLevel;
			//console.log(scene.current);

			// check if finished 
			if (connectedFaces.length == scene.data.face.length) {
				timeNeeded = Math.round((new Date() - startTime)/100) / 10;
				startTime = 0;
				hintstart = 0;
				document.getElementById("complete").innerHTML = "Solved in <br>"+timeNeeded+ " seconds";
				// put the time into local storage
				saveLevelFinishTime(whichConfig,whichPano,Math.round(timeNeeded));
				timeNeeded = 0;
				document.getElementById("complete").style.visibility = "visible";
				document.getElementById("status").style.visibility = "hidden";
				//document.getElementById("zoomIn").style.visibility = "hidden";

				//switch off lights
				lightsOut = true;

				//get rid of grid
				removeGrid();

			} else {
				document.getElementById("status").innerHTML = connectedFaces.length + " of " + scene.data.face.length + " correct"
			}
		}

		function removeGrid() {
			setTimeout(function() {
				scene.getObjectByName("poly").getObjectByName("edgeMesh").material.visible = false;
				//scene.getObjectByName("poly").getObjectByName("vertexMesh").material.visible=false;
				document.getElementById("nextLevel").style.visibility = "visible";
			}, 2000);
			setTimeout(function() {
				document.getElementById("complete").style.visibility = "hidden";
				document.getElementById("info").innerHTML = PP_config[whichConfig][whichPano][0];			
				document.getElementById("info").style.visibility = "visible";
			}, 2000);
		}

		var HintTile = null;
		var hintween;
		function animate() {
			if (!lightsOut) {
				raycaster.setFromCamera(mouse, camera);
				var intersects = raycaster.intersectObjects(scene.selectable);
				if (intersects.length > 0) {
					// do rotation business for face
					if (INTERSECTED != intersects[0].object) {
						//if (INTERSECTED) INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
						INTERSECTED = intersects[0].object;
						//console.log("===== hover over face " + INTERSECTED.faceNum + " =================");
						//console.log(INTERSECTED);
						if (INTERSECTED) INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
						//if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex - 0x222200 );	
					}
					if (rightClick) {
						//console.log("=====  face " + INTERSECTED.faceNum + " =================");
						rotate(INTERSECTED, true);
						rightClick = false;
						// start the timers on first click
						if (startTime == 0) startTime = new Date();
						if (hintstart == 0) hintstart = new Date();
						// restore original color of hint tile
						if (HintTile) {
							HintTile.material.color.setHex(HintTile.saveColour);
							HintTile = null;
							hintween.stop();
						}	
					}
					intersects = null;
				} else {
					if (INTERSECTED) {
						INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
					}
					INTERSECTED = null;
					rightClick = false;
				}
				// if time since last click > hintstimer                       and there was a click and hints are enabled
				if (((Math.round((new Date() - hintstart)/100) / 10) > hintstimer) && (hintstart > 0) && hints){
					for (var k = 0; k < scene.data.face.length; k++) {
						if ((connect[k]%4) !=0) { // if modulo 4 is not 0 => meaning this tile is NOT correct
							//console.log("face ",k," is first wrong one");
							HintTile = scene.selectable[k];
							//console.log(HintTile)
							HintTile.saveColour = HintTile.material.color.getHex();
							//console.log(HintTile.material.color)
							// still not really happy with the hint colours
							hintween = new TWEEN.Tween(HintTile.material.color.sub(new THREE.Color(0.5,0.7,0.7)))
								.to({r: 1.5, g: 1.4, b:1.1 }, 1000)
								.repeat(Infinity)
								.yoyo(true)
								.easing(TWEEN.Easing.Quartic.InOut)
								.start();
							break; // only need the first one
						}	
					}	
					hintstart = 0;
				}
				
			}

			TWEEN.update();
			//renderer.setAnimationLoop( render );
			requestAnimationFrame(animate);
			//controls.reverse = dragDir;
			controls.update();
			render();
		}
	
		// animate rotation????
		function rotate(mesh, check) {
			//console.log("rotate",mesh)
			var corners = mesh.geometry.vertices.length;
			mesh.position.sub(mesh.geometry.centerPoint); // remove the offset
			mesh.position.applyAxisAngle(mesh.geometry.faces[0].normal, d2r(360 / corners * rotateDir )); // rotate the POSITION
			mesh.position.add(mesh.geometry.centerPoint); // re-add the offset

			mesh.rotateOnAxis(mesh.geometry.faces[0].normal, d2r(360 / corners * rotateDir)); // rotate the OBJECT

			// adjust the connect data and get it checked out
			if (rotateDir === 1) // rotateDir is the rotation direction
                connect[mesh.faceNum]+=1;
			else	
                connect[mesh.faceNum]-=1;
				
			if (check) checkPanoConnect();
		}
		
		
		

		// Converts from degrees to radians.
		function d2r(degrees) {
			return degrees * Math.PI / 180;
		};

		function onMouseMove(event) {
			// calculate mouse position in normalized device coordinates
			// (-1 to +1) for both components
			mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
			mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
		}



		// if I don't use TouchDown or Up event listeners the menu works but not the raycast.
		function onTouchDown(event) {
			touchTime = new Date();
		}

		function onTouchUp(event) {
			//console.log("onTouchUp event.target",event.target);
			event.preventDefault();
			var diff = new Date() - touchTime;
			//console.log(diff);
			if (diff < 200) { // time to distinguish between click and drag
				// Don't propogate the event to the document
					rightClick = true;
			}
			if (typeof event.changedTouches != "undefined") {
				// this changes the touch event to the correct mouse values for the raycast BUT menu not working any more
				mouse.x = (event.changedTouches[0].clientX / window.innerWidth) * 2 - 1;
				mouse.y = -(event.changedTouches[0].clientY / window.innerHeight) * 2 + 1;
			}
		}

		function render() {
			if (lightsOut) {
				light.intensity -= 0.015;
				//console.log(scene.getObjectByName("poly").getObjectByName("edgeMesh"))
			}
			light.position.copy(camera.position);
			renderer.render(scene, camera);
		}

		function onWindowResize() {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		}

	