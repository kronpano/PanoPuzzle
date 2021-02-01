// this file needs to be changed by the user
// it contains the information about your panoramas and how they should be puzzled as well as the text displayed after it is solved

// the text can be html formatted - just remember - it needs to fit into the Info box 

// the patterns are explained at the bottom of the file

// colour is a hex representation in the format 0x<R><G><B> e.g. 0x000000 is black 0xFF0000 is red .....

// the directory is the path relative to the images directory
// in the directory (e.g. Cube1) the script expects the cube faces named back.jpg, bottom.jpg, front.jpg, left.jpg, right.jpg and top.jpg
// in a size like 512x512, 1024x1024 or 2048x2048

// I usually use PTGui to make this conversion - this allows to set the size and jpg compression - smaller files load quicker BUT you might get compression artifacts

// This conversion could be implemented in javascript as well but it would need to run every time again
// Doinig it in javascript means it would use the device for the conversion which might take some time so I decided NOT to do the conversion
// in the script but require the cube faces as input

// there are also free online services you can use to convert an equirectangular image to cube faces like
//
// https://jaxry.github.io/panorama-to-cubemap/
// 
// and free tools for download
// https://pragmar.com/qbit/

// please create the cube faces so that they are sized to a power of 2 e.g. 1024x1024 or 2048x2048
// this will prevent the script from complaining (warnings) that the texture is not a power of 2




// needed here to define the links to other categories
const baseURL = window.location.href.split("?")[0];


// needed to make it possible to run several puzzle games on the same URL with different settings...
const ConfigName ="MoreCollections"

// which configuration to read for the current puzzle collection
const whichDefaultConfig ="ColouredMazeNames";

// time in ms the info stays before before going by itself
const infoTime = 15000;

// percentage of tiles shuffeld on easy or hard
// the default is specified in PanoText.js for each panorama individually
const panoShuffleEasy = 10;
const panoShuffleHard = 70;




/*
information about the single panoramas and how to puzzle them
The variable needed is PANO and it needs to be constructed in the following way

PP_config = { 
"config-name-1" : [
		[version number, description of config 1, author, date created],  <-- 	element 0 is used for some meta data - version should change when re-reading
																					of this config is wanted like e.g. a panorama has been removed or order has changed
	 
		["some html text - include <class='txt'> so it can be shown in the overview of all puzzles",
		 "pattern","percent scrambled","color of grid","directory to find the cube faces","unique id"
		],	
		:
		:
		["some html text - include <class='txt'> so it can be shown in the overview of all puzzles",
	 	"pattern","percent scrambled","color of grid","directory to find the cube faces","unique id"
		],
	], //<-- end bracked of first config
"config-name-2" : [    // this is the second config 
		[version number config 2, description of config 2, author, date created],
		["some html text - include <class='txt'> so it can be shown in the overview of all puzzles",
		 "pattern","percent scrambled","color of grid","directory to find the cube faces","unique id"
		],	
		:
		:
		["some html text - include <class='txt'> so it can be shown in the overview of all puzzles",
	 	"pattern","percent scrambled","color of grid","directory to find the cube faces","unique id"
		],
	]  	//<- end bracket config 2	
} //<-- closing bracket for PP_config variable		

// the unique ID is used when sharing a puzzle via a share button - this makes sure that even if the configuration of a puzzle has changed that the link still links to the correct puzzle

*/


// if you have several categories add this to the html blurb of the last one which gives the user a choice on how to continue.
const AgainOrCategory = "<h5>Next to play this category again or <a href='javascript:ShowCategories()'>choose another category</a></h5>"


PP = { 
	"InfoLinks":{
		// THIS TEXT CAN/SHOULD BE CHANGED BY THE USER - it is sort of the intro text of the puzzle
		//Your html formatted info text  - CAREFUL - this needs to be in single forward quotes  ` if you have multi line text !!!
			"info":`
			<h3>PanoPuzzle</h3>
			<h5><div id='instruction'>Click/touch the puzzle pieces to rotate them until the puzzle is solved.<br>Zoom out lets you look at/solve the puzzle from the outside of a cube.</div></h5>
			<h5>Currently you are playing <div id='currentlyPlaying' class='glow'>info of config</div></h5>
			<h5>Created by Bernd Kronmueller © &nbsp&nbspv1.2
				<br><br>
				Here you can put your own info including links like this one to <a id="gitLink" href='https://github.com/kronpano/PanoPuzzle' target='_blank'>github</a>
				<br>
				Feedback is appreciated - raise <a id="gitIssueLink" href='https://github.com/kronpano/PanoPuzzle/issues' target='_blank'>issues on GitHub</a> 
				<br>
				and/or follow it on <a id="fbLink" href='//facebook.com/panopuzzle/' target='_blank'>facebook</a>
			</h5>`,
		
		// links contains all the links that can appear in the "More collections" tab
		"links":{
			"maze": {title:"A puzzle of a maze",
			 			href:baseURL+"?config=maze&pano=2",
			 			text:"Maze Puzzle plain"
						},
			"grid":	{title:"Not really a puzzle - shows the build-in grid patterns if you want to use it yourself", 
						href:baseURL+"?config=grid",
						text:"Grid demo - shows build-in grid patterns of PanoPuzzle"
						}, 			 
			"ColouredMazeNames":	{title:"Coloured maze with names", 
						href:baseURL+"?config=ColouredMazeNames",
						text:"Coloured maze with names different subdirectory"
						}, 
			"ColouredMaze":{title:"Coloured maze", 
						href:baseURL+"?config=ColouredMaze&pano=3",
						text:"Coloured maze from different subdirectory"
						}			 			 
		},
		// here you define which of the links above will be shown for a certain configuration	
		"maze_Links":[
			"grid","ColouredMazeNames","ColouredMaze"
		],
		"grid_Links":[
			"maze","ColouredMazeNames","ColouredMaze"
		],
		"ColouredMazeNames_Links":[
			"maze","grid","ColouredMaze"
		],
		"ColouredMaze_Links":[
			"maze","grid","ColouredMazeNames"
		]						
	}
}		


PP_config = { 	
// this section is for the grid demo showing all the different grid patterns	
"grid" : [
	[21,"Demonstration of the grid patterns<br>several collections","Bernd Kronmueller","January 2021"],
	 
	["<h2 class='txt'>Pano with lines - 44 piece</h2>",
	 1,77,0xFF0000,"pano1","gr_44"
	],	

	["<h2 class='txt'>Pano with lines - 54 pieces</h2>",
	 2,75,0x26A69A ,"pano1","gr_54"
	],

	["<h2 class='txt'>Pano with lines - 58 pieces</h2>",
	 3,75,0xC0392B ,"pano1","gr_58"
	],
	
	["<h2 class='txt'>Pano with lines - 66 pieces</h2>",
	 4,80,0x000000,"pano1","gr_66"
	],

	["<h2 class='txt'>Pano with lines - 68 pieces</h2>",
	 5,75,0xF7DC6F ,"pano1","gr_68"
	],

	["<h2 class='txt'>Pano with lines - 72 pieces</h2>",
	 6,75,0xC0392B ,"pano1","gr_72"
	],	
	
	["<h2 class='txt'>Pano with lines - 80 pieces</h2>",
	 7,70,0xF7DC6F,"pano1","gr_80"
	],
	
	["<h2 class='txt'>Pano with lines - 82 pieces</h2>",
	 8,70,0x26A69A,"pano1","gr_82"
	],
	
	["<h2 class='txt'>Pano with lines - 90 pieces</h2>",
	 9,75,0xC0392B ,"pano1","gr_90"
	],	

	["<h2 class='txt'>Pano with lines - 96 pieces</h2>",
	 10,5,0x26A69A ,"pano1","gr_96"
	],
	
	["<h2 class='txt'>Pano with lines - 122 pieces</h2>",
	 11,5,0x26A69A ,"pano1","gr_122"
	],
	
	["<h2 class='txt'>Pano with lines - 124 pieces</h2>",
	12,5,0xC0392B ,"pano1","gr_124"
	],
	
	["<h2 class='txt'>Pano with lines - 132 pieces</h2>"  + AgainOrCategory,
	 13,3,0xF7DC6F,"pano1","gr_132"
	]
  ],

  "maze" : [
	[21,"Maze demo to show<br>several collections","Bernd Kronmueller","January 2021"],
	 
	["<h2 class='txt'>Plain maze - 44 piece</h2>",
	 1,77,0xF7DC6F,"pano2","maze_6"
	],	

	["<h2 class='txt'>Plain maze - 54 pieces</h2>",
	 2,75,0x26A69A ,"pano2","maze_5"
	],

	["<h2 class='txt'>Plain maze - 58 pieces</h2>",
	 3,75,0xC0392B ,"pano2","maze_4"
	],
	
	["<h2 class='txt'>Plain maze - 66 pieces</h2>",
	 4,80,0x000000,"pano2","maze_3"
	],

	["<h2 class='txt'>Plain maze - 68 pieces</h2>",
	 5,75,0xF7DC6F ,"pano2","maze_2"
	],

	["<h2 class='txt'>Plain maze - 72 pieces</h2>" + AgainOrCategory,
	 6,75,0xC0392B ,"pano2","maze_1"
	]
  ],

  "ColouredMazeNames" : [
	[21,"More maze puzzles to show<br>several collections in different directories","Bernd Kronmueller","January 2021"],
	 
	["<h2 class='txt'>Maze side names - 44 piece</h2>",
	 1,77,0xF7DC6F,"collection2/pano1","CMN_6"
	],	

	["<h2 class='txt'>Maze side names - 54 pieces</h2>",
	 2,75,0x26A69A ,"collection2/pano1","CMN_5"
	],

	["<h2 class='txt'>Maze side names - 58 pieces</h2>",
	 3,75,0xC0392B ,"collection2/pano1","CMN_4"
	],
	
	["<h2 class='txt'>Maze side names - 66 pieces</h2>",
	 4,80,0x000000,"collection2/pano1","CMN_3"
	],

	["<h2 class='txt'>Maze side names - 68 pieces</h2>",
	 5,75,0xF7DC6F ,"collection2/pano1","CMN_2"
	],

	["<h2 class='txt'>Maze side names - 72 pieces</h2>" + AgainOrCategory,
	 6,75,0xC0392B ,"collection2/pano1","CMN_1"
	]
  ],

  "ColouredMaze" : [
	[21,"Coloured maze puzzles to show<br>several collections in different directories","Bernd Kronmueller","January 2021"],
	 
	["<h2 class='txt'>Coloured maze - 44 piece</h2>",
	 4,77,0xF7DC6F,"collection2/pano2","CM_6"
	],	

	["<h2 class='txt'>Coloured maze- 54 pieces</h2>",
	 5,75,0x26A69A ,"collection2/pano2","CM_5"
	],

	["<h2 class='txt'>Coloured maze- 58 pieces</h2>",
	 7,75,0xC0392B ,"collection2/pano2","CM_4"
	],
	
	["<h2 class='txt'>Coloured maze- 66 pieces</h2>",
	 3,80,0x000000,"collection2/pano2","CM_3"
	],

	["<h2 class='txt'>Coloured maze- 68 pieces</h2>",
	 2,75,0xF7DC6F ,"collection2/pano2","CM_2"
	],

	["<h2 class='txt'>Coloured maze- 72 pieces</h2>" + AgainOrCategory,
	 8,75,0xC0392B ,"collection2/pano2","CM_1"
	]
  ],  

}

/*  Patterns
case 1:
	// 44 pieces
	// sides around 9s top/bottom 4s
case 2:
	// 54 pieces
	// all sides in 9s
case 3:
	// 58 pieces
	// top bottom 9s
	// around 4s
	// subdivide every second side around again
case 4:
	// 66 pieces
	// all sides 9s
	// middle ones of sides again in 4
case 5:
	// 68 pieces
	// top bottom 9s
	// 2 sides 4s
	// other two sides 9s
	// divide the 2 sides of 4s again
case 6:
	// 72 pieces
	// sub top/bottom once - sides of cube twice 
case 7:
	// 80 pieces
	// all around 9s
	// top and bottom into 4					
	// middle ones of sides again in 4
case 8:
	// 82 pieces
	// all around 4s
	// top bottom 9s
	// all around each face 4s again
case 9:	
	// 90 pieces
	// all sides 9s
	// diagonals again ---- too much!!
case 10:
	// 96 pieces		
	// sub whole cube twice 6 for the first subdivsion and then 24 for the second one
case 11:
	// 122 pieces
	// all around 4s
	// top bottom 9s
	// all around each face 4s again
	// all around the rest 9s again
case 12:
	// 124 pieces
	// all sides in 4
	// diagonals another 4
	// the others (excepts floor/sky) in 9s
case 13:
	// 132 pieces
	// all in 9s
	// some of them in 4s again
			
*/	