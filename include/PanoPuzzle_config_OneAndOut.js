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
const ConfigName ="OnePuzzleAndOut"

// which configuration to read for the current puzzle collection
const whichDefaultConfig = "OneAndOut";   //possible values come out of the PanoPuzzle_config.js 

// time in ms the info stays before before going by itself
const infoTime = 15000;

// percentage of tiles shuffeld on easy or hard
// the default is specified in PanoText.js for each panorama individually
const panoShuffleEasy = 2;
const panoShuffleHard = 90;



/*
information about the single panoramas and how to puzzle them
The variable needed is PANO and it needs to be constructed in the following way

PP_config = { 
"config-name-1" : [
		[version number, description of config 1, author, date created],  <-- 	element 0 is used for some meta data - version should change when re-reading
																					of this config is wanted like e.g. a panorama has been removed or order has changed
	 
		["some html text - include <class='txt'> so it can be shown in the overview of all puzzles",
		 "pattern","percent scrambled in normal","color of grid","directory to find the cube faces","unique id"
		]

} //<-- closing bracket for PP_config variable		

// the unique ID is used when sharing a puzzle via a share button - this makes sure that even if the configuration of a puzzle has changed that the link still links to the correct puzzle

*/



PP = { 
"InfoLinks":{
	// THIS TEXT CAN/SHOULD BE CHANGED BY THE USER - it is sort of the intro text of the puzzle
	//Your html formatted info text  - CAREFUL - this needs to be in single forward quotes  ` if you have multi line text !!!
		"info":`
		<h4>PanoPuzzle - Single puzzle demo</h4>
		<h6><div id='instruction'>Click/touch the puzzle pieces to rotate them until the puzzle is solved.<br>Zoom out lets you look at/solve the puzzle from the outside of a cube.</div></h6>
		<h5><div id='currentlyPlaying' class='glow'>info of config</div></h5>
		<h6>Created by Bernd Kronmueller © &nbsp&nbspv1.2</h6>
        `						
	}
}		

PP_config = { 
// this section is for the grid demo showing all the different grid patterns - a short description of the grid patterns is at the end of this config file. 
"OneAndOut" : [
	[4,"A single PanoPuzzle demo <br> finish it and move on","Bernd Kronmueller","13th March 2021"],
    // The text here is shown in the info screen - the rest is not really important for the OnePuzzleAndOut
	 
	["<h4 class='txt'>Cool - you have finished the puzzle<br>Click on the <a id='Link4Next' href='https://github.com/kronpano/PanoPuzzle'>link</a> to move on.</h4>",
    // this is a html formatted text that will be shown once a puzzle is solved 
    // if you want to link away from panopuzzle you just need to provide the element with the Link4Next id like this  <a id='Link4Next' href='URL'>link</a>
    // then a user can click on that link directly and leave the puzzle or you can close the "end of puzzle" message by clicking in the box - look around and the "Next" link at the top right will get you to the link as well

    // this is useful if you just want to have one puzzle somewhere and then link to a virtual tour or anything you want really.

	 2,75,0xFF0000,"OnePano","OneAndOut_1"
    // 2 is the grid pattern used
    // 75 is the percent of tiles shuffled in "normal" setting - easy and hard are defined at the top
    // 0xFF0000 is the colour of the grid
    // OnePano is the name of the directory the cubefaces need to go in
    // OneAndOut_1 is the unique ID used for sharing a link to this puzzle
    ]
  ]

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