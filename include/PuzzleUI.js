// Deals with the UI elements, the URL and the social media share 

// CHANGES IN THIS FILE MIGHT BREAK THINGS - ONLY CHANGE IF YOU KNOW WHAT YOU ARE DOING

const baseURL = window.location.href.split("?")[0];

var linkLookupObj = {}; 	// lookup table object which convertes the uniqueID of each puzzle - for social media sharing - to config/pano value
							// doing this so a shared link still points to the correct panorama even if the configuration has changed

var howDifficult = 2;	 // used in 3 way switch easy/normal/hard and passed through 1: easy, 2: normal as in config, 3: hard

var hints;
var hintstimer;
var hintstart = 0;

var slider = document.getElementById("myRange");
var output = document.getElementById("dtime");
output.innerHTML = slider.value;

slider.oninput = function() {
  output.innerHTML = this.value;
  hintstimer = parseInt(this.value);
  saveUI_Values();
}

function HintToggle() {
  var checkBox = document.getElementById("myhintswitch");
  if (checkBox.checked == true){
	document.getElementById("HintTimeSlider").style.transform = "scaleY(1)";
	if(hintstimer == null){hintstimer=20;}// first time around when the slider hasn't been move it has no value
	document.getElementById("myRange").value = hintstimer;
	output.innerHTML = hintstimer;
	hintstart = new Date();
    hints = true;
  } else {
    document.getElementById("HintTimeSlider").style.transform = "scaleY(0)";  
	hints = false;
  }
  saveUI_Values();
}

function CountToggle() {
  var checkBox = document.getElementById("mycountswitch");
  if (checkBox.checked == true){
    document.getElementById("status").style.transform = "scale(1,1)";
  } else {
    document.getElementById("status").style.transform = "scale(0,0)";  
  }
}

var rotateDir;
function RotateToggle() {
  var checkBox = document.getElementById("myrotateswitch");
  if(document.getElementById("zoomOut").style.visibility == "hidden"){
	rotateDir *= -1; // you are zoomed out so direction reversed
  }else{
	  if (checkBox.checked == true){
		rotateDir = -1;
	  } else {
		rotateDir = 1;
	  }
  }
  saveUI_Values();
  //rotateDir *= -1; // just change direction - this way because zoomOut also needs to change so outside rotate is the same direction 
}

var dragDir;
function DragToggle() {
  var checkBox = document.getElementById("mydragswitch");
  if (checkBox.checked == true){
    dragDir = -1;
  } else {
    dragDir = 1;
  }
  if (typeof controls.reverse != "undefined") {
	controls.reverse = dragDir;
	controls.update();
  }
  saveUI_Values();
}

function difficulty(how){
	var easy = document.getElementById("easy");
	var normal = document.getElementById("normal");
	var hard = document.getElementById("hard");
	var selector = document.getElementById("selector");
	if(how === "easy"){
		selector.style.left = 0;
		selector.style.width = easy.clientWidth + "px";
		selector.style.backgroundColor = "#37a737";
		selector.innerHTML = "Easy";
		document.getElementById("myhintswitch").checked = true;
		HintToggle();
		document.getElementById("mycountswitch").checked = true;
		CountToggle();
		howDifficult = 1;
	}else if(how === "normal"){
		selector.style.left = easy.clientWidth + "px";
		selector.style.width = normal.clientWidth + "px";
		selector.innerHTML = "Normal";
		document.getElementById("mycountswitch").checked = false;
		CountToggle();
		document.getElementById("myhintswitch").checked = true;
		HintToggle();
		howDifficult = 2;
		selector.style.backgroundColor = "#418d92";
	}else{
		selector.style.left = easy.clientWidth + normal.clientWidth + 1 + "px";
		selector.style.width = hard.clientWidth + "px";
		selector.innerHTML = "Hard";
		document.getElementById("myhintswitch").checked = false;
		HintToggle();
		document.getElementById("mycountswitch").checked = false;
		CountToggle();
		howDifficult = 3;
		selector.style.backgroundColor = "#ad2e49";
	}
	
	// change the URL to the new one - needs checks that URL exists in the form I want it - if it doesn't then create it
	window.history.pushState({},'',window.location.href.replace(/hh=\d/g,"hh="+howDifficult)); 
	saveUI_Values();
	startGame(); 
}

// saving user settings 
function saveUI_Values(){			
	// Check for session storage support
	if (window.sessionStorage) {	
		try {
			// general settings changed via the UI 
			UIsettings.rotateDir = document.getElementById("myrotateswitch").checked;
			UIsettings.dragDir = document.getElementById("mydragswitch").checked;
			UIsettings.hints = document.getElementById("myhintswitch").checked;
			UIsettings.hintstimer = hintstimer;
			UIsettings.level = howDifficult;
			UIsettings.count = document.getElementById("mycountswitch").checked; 
			// save UI settings to local storage
			localStorage.setItem('PP_UI_settings',JSON.stringify(UIsettings));
		} catch (e) {
		// Alert user for errors
			console.log('Local Storage error :',e);
		}

	} else {
		// No session storage support
		console.log('No session storage support');
	}
}


function openNav(event) {
  event.preventDefault();
  document.getElementById("mySidepanel").style.width = "auto";
  document.getElementById("mySidepanel").style.paddingLeft = "10px";
  document.getElementById("mySidepanel").style.paddingRight = "10px";
  document.getElementById("mySidepanel").style.visibility = "visible"; 
  document.getElementById("cogIcon").style.visibility = "hidden";
}

function closeNav(event) {
  event.preventDefault();
  saveUI_Values();
  document.getElementById("mySidepanel").style.width = "0";
  document.getElementById("mySidepanel").style.paddingLeft = "0";  
  document.getElementById("mySidepanel").style.paddingRight = "0"; 
  document.getElementById("mySidepanel").style.visibility = "hidden"; 
  document.getElementById("cogIcon").style.visibility = "visible";  
}

// when starting a new puzzle check if the config has changed - if so reflect that in the local storage times, configs....
function checkConfigChange(){

	ReadConfigSettings = undefined;
	FileConfigs = Object.keys(PP_config);
	ConfigSettings.configs = [];

	if(localStorage.getItem("PP_Config_settings")){
		ReadConfigSettings = JSON.parse(localStorage.getItem('PP_Config_settings'));
	}
	if(ReadConfigSettings){
		// array intersection to find which elements are in both
		let inBoth = ReadConfigSettings.configs.filter( x => FileConfigs.includes(x));
		if(inBoth.length>0){
			//alert("in Both => check versions: "+JSON.stringify(inBoth));
			for(const config of inBoth){
				compareVersions(config);
			}
		}

		// array difference to find which ones add
		let inConfigFile = FileConfigs.filter( x => !ReadConfigSettings.configs.includes(x));
		if (inConfigFile.length>0){
			//alert("only in config file NOT in local storage => add "+JSON.stringify(inConfigFile));
			for(const config of inConfigFile){
				addConfig(config);
			}
		}

		// array difference to find which ones remove
		/*
		// don't need to handle remove since compare only copies the ones in both and removes superfluous ones from local storage in that go 
		let inLocalStorage = ReadConfigSettings.configs.filter( x => !FileConfigs.includes(x));
		if(inLocalStorage.length > 0){
			//alert("only in local storage NOT in file any more => remove "+JSON.stringify(inLocalStorage));
		}
		*/	
	}else{
		// if I don't have any settings  they all need to be added
		//alert("initialize all")
		for(const config of Object.keys(PP_config)){
			addConfig(config);
		}
	}

	// Now at last save settings to local storage
	localStorage.setItem('PP_Config_settings',JSON.stringify(ConfigSettings));
	//alert(JSON.stringify(ConfigSettings));

	// need to populate the lookup table which convertes the uniqueID of each puzzle - for social media sharing - to config/pano value
	// doing this so a shared link still points to the correct panorama even if the configuration has changed
	// if a uniqueID does NOT exist any more - meaning this puzzle has been removed from the configuration a message should pop up and lead you to the newest puzzle in this config.
	createShareLinkLookup();

}

function compareVersions(config){
	//get local storage version
	const savedVersion = ReadConfigSettings["configVersion_"+config];
	//and compare with the one in the config file
	const configVersion = PP_config[config][0][0]; 
	//alert(config+" local: "+savedVersion+" config: "+configVersion);
	if(savedVersion == configVersion){
		//if the same just copy the levelTimes 
		ConfigSettings["levelTimes_"+config] = ReadConfigSettings["levelTimes_"+config];
	}else{
		//otherwise initialise a new levelTimes array
		levelTimes = "version="+configVersion // sets element 0 (which is not a level) to the version number of this configuration
		for(x = 1; x<PP_config[config].length; x++){
			levelTimes+= ","+x+"=?";
		}
		// and assign it
		ConfigSettings["levelTimes_"+config] = levelTimes;
	}
	// also set new config Version
	ConfigSettings["configVersion_"+config] = PP_config[config][0][0];
	// and push it onto the configs array for easier lookup
	ConfigSettings.configs.push(config); 
}

function addConfig(config){
	// make up new level times arrays
	levelTimes = "version="+PP_config[config][0][0]; // sets element 0 (which is not a level) to the version number of this configuration
	for(x = 1; x<PP_config[config].length; x++){
		levelTimes+= ","+x+"=?";
	}
	// assign them
	ConfigSettings["levelTimes_"+config] = levelTimes;
	// and set the other values as well
	ConfigSettings["configVersion_"+config] = PP_config[config][0][0];
	ConfigSettings.configs.push(config); 
}

function createShareLinkLookup(){
	var lookupConfig, lookupPano;
	for (const [key, value] of Object.entries(PP_config)){
		lookupConfig = key;
		for (var panonum=1; panonum<PP_config[lookupConfig].length; panonum++){
			linkLookupObj[PP_config[lookupConfig][panonum][5]]={lookupConfig,panonum};

		}
	}
}

function saveLevelFinishTime(config, pano, time){
	if(localStorage.getItem("PP_Config_settings")){
		ReadConfigSettings = JSON.parse(localStorage.getItem('PP_Config_settings'));
		// if "time" is 0 that just means the pano has been started so only change a ? (indicating "not played") - don't replace an existing time
		if(time == 0){
			var regex = new RegExp(','+pano+'=(0|\\?)');	
		}else{// else if there is a time > 0 replace the current time
			var regex = new RegExp(','+pano+'=(\\d+|\\?)');
		}
		ReadConfigSettings["levelTimes_"+config] = ReadConfigSettings["levelTimes_"+config].replace(regex, ","+pano+"="+time);
		localStorage.setItem('PP_Config_settings',JSON.stringify(ReadConfigSettings));
	}	
}

// getting user settings and apply them
function read_UI_values(){
		if (localStorage.getItem('PP_UI_settings')) {
			UIsettings = JSON.parse(localStorage.getItem('PP_UI_settings'));

			//whichPano = ReadConfigSettings.whichPano;
			document.getElementById("myrotateswitch").checked = UIsettings.rotateDir
			RotateToggle();

			howDifficult=UIsettings.level;
			if(howDifficult == 1){difficulty('easy')};
			if(howDifficult == 2){difficulty('normal')};
			if(howDifficult == 3){difficulty('hard')};
			
			document.getElementById("mydragswitch").checked = UIsettings.dragDir
			DragToggle();
			
			hintstimer = UIsettings.hintstimer;
			document.getElementById("myhintswitch").checked = UIsettings.hints
			HintToggle()
			
			document.getElementById("mycountswitch").checked = UIsettings.count			
			CountToggle();
		
		}else{ // no previous settings
			difficulty('normal');
			rotateDir = 1;
			hintstimer = 20;
		}
}

// get the URL to see which pano and which config to use
function checkURL(){
	//readSessionValues(); // get 'old' settings
	var returnValue = true;
	const urlParams = new URLSearchParams(window.location.search);

	if(urlParams.has('uid')){  // this means the puzzle is accessed from a shared link - need to convert the uid to config/pano value
		const shareLink = urlParams.get('uid');
		try{whichConfig = linkLookupObj[shareLink].lookupConfig}
		catch(err){
			whichConfig = Object.keys(PP_config)[Object.keys(PP_config).length * Math.random() | 0];
			returnValue = false;
		}
		try{whichPano = linkLookupObj[shareLink].panonum;}
		catch(err){
			whichPano = Math.floor(Math.random() *(PP_config[whichConfig].length/2 - 1)) + 1; // get a random number in the first half of this category
		}
		
	}else{
		if(urlParams.has('config')){
			//check if you can find the config file - if not just continue
			whichConfig = urlParams.get('config');
			if(typeof(PP_config[whichConfig]) == 'undefined')
			{// if not found set it to first available config
				whichConfig = Object.keys(PP_config)[0];
			}
		}else{
			//no config parameter so set it to first available config
			whichConfig = Object.keys(PP_config)[0];
		}
		// check panorama number - is it a number and available for this configuration
		if(urlParams.has('pano')){
			//check if the config actually has that pano
			whichPano = urlParams.get('pano');
			if(Number.isInteger(Number(whichPano))){
				if(whichPano < 1)
					{whichPano = 1;}
				if(whichPano > PP_config[whichConfig].length-1)
					{whichPano = PP_config[whichConfig].length-1;}
			}else{
				whichPano = Math.floor(Math.random() *(PP_config[whichConfig].length/2 - 1)) + 1; // get a random number in the first half of this category
			}		
		}else{
			whichPano = Math.floor(Math.random() *(PP_config[whichConfig].length/2 - 1)) + 1; // get a random number in the first half of this category
		}
	}
		
	// check hh - the "how hard" difficulty parameter
	if(urlParams.has('hh')){  
		switch (urlParams.get('hh')) {
			case "1":	difficulty('easy');
					break;
			case "2": difficulty('normal');
					break;
			case "3": difficulty('hard');
					break;
			default: difficulty('normal');
						howDifficult=2;		
		}
	}else{
		if (localStorage.getItem('PP_UI_settings')) { // if no hh parameter AND no previous hh in local storage
			howDifficult=UIsettings.level;
		}else{
			difficulty('normal');
			howDifficult=2;
		}
	}
	// set the URL to reflect the current puzzle
	window.history.pushState({},'',baseURL+'?config='+whichConfig+'&pano='+whichPano+'&hh='+howDifficult);
	return(returnValue);
}			


function createShowAllText(){
	var showAllText="<table><tbody>";
	//showAllText+='<tr><th>Puzzles in this collection</th></tr>'
	if (localStorage.getItem('PP_Config_settings')) { // only read the settings 
		ReadConfigSettings = JSON.parse(localStorage.getItem('PP_Config_settings'));
	}	

	var levelTimes = ReadConfigSettings["levelTimes_"+whichConfig].split(",");
	for(x = 1; x<PP_config[whichConfig].length; x++){
		var txthtml = document.createElement('html');
		var currentRowIndicator;
		if (whichPano == x){
			currentRowIndicator = "<tr class='current' onClick='NextLevel("+x+")'><td href='#'><td>";
		}else{
			currentRowIndicator = "<tr onClick='NextLevel("+x+")'><td href='#'><td>";
		}

		txthtml.innerHTML = PP_config[whichConfig][x][0];
		var leveltime;
		if(levelTimes[x]===x+"=?")
			{leveltime="not started";}
		else if(levelTimes[x]===x+"=0")
			{leveltime="not finished";}
		else
			{leveltime=levelTimes[x].split("=")[1]+"s";
			}
		if(txthtml.getElementsByClassName("txt").length > 0){			
			showAllText += currentRowIndicator + x +"</td><td>" 
				+ txthtml.getElementsByClassName("txt")[0].innerHTML +"</td><td>"
				+ leveltime+ "</td></a></tr>";
		}
	}
	showAllText += "</tbody></table>";
	return showAllText;
}


function createShowMoreText(){
	var whichLinks = whichConfig + "_Links";

	var showMoreText="<table><tbody>";
	if(typeof PP.InfoLinks[whichLinks] == "undefined"){
		// no <configName>Links> are found/defined for this config
		document.getElementById("TabButtonMore").style.visibility = "hidden";
		// so don't show the "More collections" tab
	}else{
		for(x = 0; x<PP.InfoLinks[whichLinks].length; x++){			
			showMoreText += '<tr><td><a class="PuzzleLink" title="' + PP.InfoLinks.links[PP.InfoLinks[whichLinks][x]].title +'"'
				+ ' href="' +PP.InfoLinks.links[PP.InfoLinks[whichLinks][x]].href + '">'
				+ PP.InfoLinks.links[PP.InfoLinks[whichLinks][x]].text+ '</a></td></tr>';
		}
	}
	showMoreText += "</tbody></table>";
	return showMoreText;  
}









// go fullscreen
//var elem = document.documentElement;
function openFullscreen(event) {
	event.preventDefault();
	if (document.documentElement.requestFullscreen) {
	document.documentElement.requestFullscreen();
	} else if (document.documentElement.mozRequestFullScreen) { /* Firefox */
	document.documentElement.mozRequestFullScreen();
	} else if (document.documentElement.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
	document.documentElement.webkitRequestFullscreen();
	} else if (document.documentElement.msRequestFullscreen) { /* IE/Edge */
	document.documentElement.msRequestFullscreen();
	}
}
var toggle = false;

function toggleFS(event){
	event.preventDefault();
	if (toggle){
		document.getElementById("FullScreen").style.visibility = "visible";
		document.getElementById("ExitFullScreen").style.visibility = "hidden";				
		toggle=false
	}else{
		document.getElementById("FullScreen").style.visibility = "hidden";
		document.getElementById("ExitFullScreen").style.visibility = "visible";
		toggle = true;
	}		
}
/* Standard syntax */
document.addEventListener("fullscreenchange", function() {
	toggleFS(event);
});

/* Firefox */
document.addEventListener("mozfullscreenchange", function() {
	toggleFS(event);
});

/* Chrome, Safari and Opera */
document.addEventListener("webkitfullscreenchange", function() {
	toggleFS(event);
});

/* IE / Edge */
document.addEventListener("msfullscreenchange", function() {
	toggleFS(event);
});		

function exitFullscreen(event) {
	event.preventDefault();
	if (document.exitFullscreen) {
	document.exitFullscreen();
	} else if (document.mozCancelFullScreen) {
	document.mozCancelFullScreen();
	} else if (document.webkitExitFullscreen) {
	document.webkitExitFullscreen();
	} else if (document.msExitFullscreen) {
	document.msExitFullscreen();
	}
document.getElementById("ExitFullScreen").style.visibility = "hidden";
document.getElementById("FullScreen").style.visibility = "visible";
}

function zoomout(event) {
	//console.log("zoomOut event.target",event.target.id);
	event.preventDefault();  // prevent double fire of zoomin/out
	camera.getWorldDirection(dir)
	var to = {
		x: dir.x* 500,
		y: dir.y* 500,
		z: dir.z* 500
	};
	document.getElementById("zoomIn").style.visibility = "visible";
	document.getElementById("zoomOut").style.visibility = "hidden";
	controls.reverse = 1;
	// reset distances to make zoom smooth
	controls.minDistance = 0;
	controls.maxDistance = Infinity;
	controls.enableZoom = true;
	controls.setFL(25); // set focal length before zooming out
	controls.FOVzoom = false;
	rotateDir *= -1; // reverse the rotation direction when outside 
	controls.update;
	//console.log("OUT from", camera.position,"to",to);
	startTween(to);
	
	// put limits in place again - after zoom is done
	setTimeout(function() {
		controls.minDistance = 300;
		controls.maxDistance = 800;
	}, 1000);

}

function zoomin(event) {
	//console.log("zoomIn event.target",event.target.id);
	event.preventDefault();  // prevent double fire of zoomin/out
	camera.getWorldDirection(dir)
	var to = {
		x: dir.x * 0.1,
		y: dir.y * 0.1,
		z: dir.z * 0.1
	};
	document.getElementById("zoomOut").style.visibility = "visible";
	document.getElementById("zoomIn").style.visibility = "hidden";
	controls.reverse = dragDir;
	// reset distances to make zoom smooth
	controls.minDistance = 0;
	controls.maxDistance = Infinity;
	controls.enableZoom = false;
	controls.target = new THREE.Vector3(dir.x * -1, dir.y * -1, dir.z * -1);
	controls.setFL(20); // set focal length before zooming out
	controls.FOVzoom = true;
	rotateDir *= -1; // reverse the rotation direction when going inside again 			
	controls.update;
	//	.log("IN from", camera.position,"to",to);
	startTween(to);

}

function startTween(to) {
	var from = {
		x: camera.position.x,
		y: camera.position.y,
		z: camera.position.z
	};
	var tween = new TWEEN.Tween(from)
		.to(to, 900)
		.easing(TWEEN.Easing.Cubic.In)
		.onUpdate(function() {
			camera.position.set(this.x, this.y, this.z);
		})
		.start();
}

function NOTUSED_Info(event) {
	//console.log(event);
	//event.preventDefault();
	document.getElementById("cogIcon").style.visibility = "visible";
	document.getElementById("info").style.visibility = "hidden";
}

function InfoIcon(event) {
	closeNav(event);
	event.preventDefault();
	//document.getElementById("info").innerHTML = InfoText;
	document.getElementById("info").innerHTML = PP.InfoLinks.info;
	document.getElementById("currentlyPlaying").innerHTML=PP_config[whichConfig][0][1];
	document.getElementById("info").style.visibility = "visible";
	document.getElementById("cogIcon").style.visibility = "hidden";
	timeoutHandle = setTimeout(function() {
		document.getElementById("info").style.visibility = "hidden";
		document.getElementById("cogIcon").style.visibility = "visible";
	}, infoTime);
}

function InfoClose(event){
	//alert(event);
	document.getElementById("cogIcon").style.visibility = "visible";
	document.getElementById("info").style.visibility = "hidden";
	window.clearTimeout(timeoutHandle);
}


function ShowAllIcon(event) {
	closeNav(event);
	event.preventDefault();
	document.getElementById("showcurrent").innerHTML = createShowAllText();
	document.getElementById("showmore").innerHTML = createShowMoreText();

	document.getElementById("showall").style.visibility = "visible";
	document.getElementById("showcurrent").style.visibility = "visible";
	document.getElementById("cogIcon").style.visibility = "hidden";

	document.getElementById("TabButtonCurrent").className = "tabactive";
	document.getElementById("TabButtonMore").className = "tabpassive";

	document.getElementById("showcurrent").style.display = "block";
	document.getElementById("showmore").style.display = "none";
}

function ShowCategories(event) {
	document.getElementById("showcurrent").innerHTML = createShowAllText();
	document.getElementById("showmore").innerHTML = createShowMoreText();

	document.getElementById("showall").style.visibility = "visible";
	document.getElementById("showmore").style.visibility = "visible";
	document.getElementById("cogIcon").style.visibility = "hidden";

	document.getElementById("TabButtonCurrent").className = "tabpassive";
	document.getElementById("TabButtonMore").className = "tabactive";
	document.getElementById("showmore").style.display = "block";
	document.getElementById("showcurrent").style.display = "none";
}

function CloseShowAll() {
	document.getElementById("showall").style.visibility = "hidden";
	document.getElementById("showcurrent").style.visibility = "hidden";
	document.getElementById("showmore").style.visibility = "hidden";
	document.getElementById("cogIcon").style.visibility = "visible"; 
}


function NextLevel(nextOrNumber) {
	if(typeof(nextOrNumber) === typeof(true)){ // if argument is true just go to the next one
		// checks length of pano description array to decide if there are more panoramas to display	
			if (whichPano < (PP_config[whichConfig].length -1)){
				whichPano++;
			}else{
				// show a message that this collection is finished but there are more.....
				whichPano =1
			}
	}else{ // if the argument is a number go to that one
		whichPano = nextOrNumber;			
	}
	
	// change the URL to the new one - needs checks that URL exists in the form I want it - if it doesn't then create it
	window.history.pushState({},'',baseURL+'?config='+whichConfig+'&pano='+whichPano+'&hh='+howDifficult); 
	
	CloseShowAll(); // close it if it was used to select a scene - and generally
	lightsOut = false;
	light.intensity = 2;

	document.getElementById("status").style.visibility = "visible";
	document.getElementById("nextLevel").style.visibility = "hidden";
	document.getElementById("zoomOut").style.visibility = "visible";
	
	// reset camera position, distances and directions
	controls.object.position.set(0,0.002,0);
	controls.target = new THREE.Vector3(0,0,1);
	controls.reverse = -1; // reset drag control to work on inside
	controls.minDistance = 0;
	controls.maxDistance = 90;		
	
	document.getElementById("zoomIn").style.visibility = "hidden";
	document.getElementById("info").style.visibility = "hidden";

	scene.data=null; // remove data stored in scene for next level
	let data = JSON.parse(JSON.stringify(POLYHEDRA.Cube)); // need to create a deep copy of my original Cube object so I can reset it for the next level.
	displayPolyhedron(data,howDifficult);
	
}

function ShowShare(event){
	event.preventDefault();
	document.getElementById("shareDiv").style.visibility = "visible";	
	document.getElementById("close-share").style.visibility = "visible";
	
	// gets the unique ID out from PP_config - if the config changes the shared link will still point to the correct puzzle
	var CurrentURL = encodeURIComponent(window.location).replace(/config.*%26hh/,"uid="+PP_config[whichConfig][whichPano][5]+"%26hh");

	window.history.pushState({},'',baseURL+'?uid='+PP_config[whichConfig][whichPano][5]+'&hh='+howDifficult);
	// get the title out of the PP_config and encode it so it can be used for sharing
	var CurrentTitle = encodeURIComponent(PP_config[whichConfig][whichPano][0].replace(/<[^>]+>/g, ' '));

	//change meta og:description for FB share  <- not being used because changing the og: data at runtime does not work!!!
	/*
		var allblurb = PP_config[whichConfig][whichPano][0];
		var titlestart = allblurb.search(">")+1;
		var titleend = allblurb.indexOf("<",2) - titlestart;
		var ShortTitle = allblurb.substr(titlestart,titleend);
		document.getElementsByTagName('meta')[8].content += ": "+ShortTitle;  <- meta[8] is the og:description in my case
	*/

	var ImgURL=encodeURIComponent("https://preview.redd.it/9u61n0v6f8q21.jpg?width=1495&format=pjpg&auto=webp&s=2ea5f01b0008fc934ae2c8b22d70d9fb48ed7a79");


	//alert(CurrentURL +"----"+CurrentTitle);
	var mySharButtons =`
	<!-- Sharingbutton Facebook -->
	<a class="resp-sharing-button__link" href="https://facebook.com/sharer/sharer.php?u=`+CurrentURL+`" target="_blank" rel="noopener" aria-label="">
		<div class="resp-sharing-button resp-sharing-button--facebook resp-sharing-button--small"><div aria-hidden="true" class="resp-sharing-button__icon resp-sharing-button__icon--solid">
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/></svg>
		</div>
		</div>
	</a>

	<!-- Sharingbutton Twitter -->
	<a class="resp-sharing-button__link" href="https://twitter.com/intent/tweet/?text=PanoPuzzle: `+CurrentTitle+`&amp;url=`+CurrentURL+`" target="_blank" rel="noopener" aria-label="">
		<div class="resp-sharing-button resp-sharing-button--twitter resp-sharing-button--small"><div aria-hidden="true" class="resp-sharing-button__icon resp-sharing-button__icon--solid">
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M23.44 4.83c-.8.37-1.5.38-2.22.02.93-.56.98-.96 1.32-2.02-.88.52-1.86.9-2.9 1.1-.82-.88-2-1.43-3.3-1.43-2.5 0-4.55 2.04-4.55 4.54 0 .36.03.7.1 1.04-3.77-.2-7.12-2-9.36-4.75-.4.67-.6 1.45-.6 2.3 0 1.56.8 2.95 2 3.77-.74-.03-1.44-.23-2.05-.57v.06c0 2.2 1.56 4.03 3.64 4.44-.67.2-1.37.2-2.06.08.58 1.8 2.26 3.12 4.25 3.16C5.78 18.1 3.37 18.74 1 18.46c2 1.3 4.4 2.04 6.97 2.04 8.35 0 12.92-6.92 12.92-12.93 0-.2 0-.4-.02-.6.9-.63 1.96-1.22 2.56-2.14z"/></svg>
		</div>
		</div>
	</a>

	<!-- Sharingbutton Tumblr -->
	<a class="resp-sharing-button__link" href="https://www.tumblr.com/widgets/share/tool?posttype=link&amp;title=`+CurrentTitle+`.&amp;caption=`+CurrentTitle+`.&amp;content=`+CurrentURL+`&amp;canonicalUrl=`+CurrentURL+`&amp;shareSource=tumblr_share_button" target="_blank" rel="noopener" aria-label="">
		<div class="resp-sharing-button resp-sharing-button--tumblr resp-sharing-button--small"><div aria-hidden="true" class="resp-sharing-button__icon resp-sharing-button__icon--solid">
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M13.5.5v5h5v4h-5V15c0 5 3.5 4.4 6 2.8v4.4c-6.7 3.2-12 0-12-4.2V9.5h-3V6.7c1-.3 2.2-.7 3-1.3.5-.5 1-1.2 1.4-2 .3-.7.6-1.7.7-3h3.8z"/></svg>
		</div>
		</div>
	</a>

	<!-- Sharingbutton Pinterest -- needs a image URL -->
	<a class="resp-sharing-button__link" href="https://pinterest.com/pin/create/button/?url=`+CurrentURL+`&amp;media=`+ImgURL+`&amp;description=`+CurrentTitle+`" target="_blank" rel="noopener" aria-label="">
		<div class="resp-sharing-button resp-sharing-button--pinterest resp-sharing-button--small"><div aria-hidden="true" class="resp-sharing-button__icon resp-sharing-button__icon--solid">
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12.14.5C5.86.5 2.7 5 2.7 8.75c0 2.27.86 4.3 2.7 5.05.3.12.57 0 .66-.33l.27-1.06c.1-.32.06-.44-.2-.73-.52-.62-.86-1.44-.86-2.6 0-3.33 2.5-6.32 6.5-6.32 3.55 0 5.5 2.17 5.5 5.07 0 3.8-1.7 7.02-4.2 7.02-1.37 0-2.4-1.14-2.07-2.54.4-1.68 1.16-3.48 1.16-4.7 0-1.07-.58-1.98-1.78-1.98-1.4 0-2.55 1.47-2.55 3.42 0 1.25.43 2.1.43 2.1l-1.7 7.2c-.5 2.13-.08 4.75-.04 5 .02.17.22.2.3.1.14-.18 1.82-2.26 2.4-4.33.16-.58.93-3.63.93-3.63.45.88 1.8 1.65 3.22 1.65 4.25 0 7.13-3.87 7.13-9.05C20.5 4.15 17.18.5 12.14.5z"/></svg>
		</div>
		</div>
	</a>

	<!-- Sharingbutton LinkedIn -->
	<a class="resp-sharing-button__link" href="https://www.linkedin.com/shareArticle?mini=true&amp;url=`+CurrentURL+`&amp;title=`+CurrentTitle+`&amp;summary=`+CurrentTitle+`&amp;source=`+CurrentURL+`" target="_blank" rel="noopener" aria-label="">
		<div class="resp-sharing-button resp-sharing-button--linkedin resp-sharing-button--small"><div aria-hidden="true" class="resp-sharing-button__icon resp-sharing-button__icon--solid">
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6.5 21.5h-5v-13h5v13zM4 6.5C2.5 6.5 1.5 5.3 1.5 4s1-2.4 2.5-2.4c1.6 0 2.5 1 2.6 2.5 0 1.4-1 2.5-2.6 2.5zm11.5 6c-1 0-2 1-2 2v7h-5v-13h5V10s1.6-1.5 4-1.5c3 0 5 2.2 5 6.3v6.7h-5v-7c0-1-1-2-2-2z"/></svg>
		</div>
		</div>
	</a>

	<!-- Sharingbutton E-Mail -->
	<a class="resp-sharing-button__link" href="mailto:?subject=Check out Panopuzzle: `+CurrentTitle+`&amp;body=`+CurrentURL+`" target="_self" rel="noopener" aria-label="">
		<div class="resp-sharing-button resp-sharing-button--email resp-sharing-button--small"><div aria-hidden="true" class="resp-sharing-button__icon resp-sharing-button__icon--solid">
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22 4H2C.9 4 0 4.9 0 6v12c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM7.25 14.43l-3.5 2c-.08.05-.17.07-.25.07-.17 0-.34-.1-.43-.25-.14-.24-.06-.55.18-.68l3.5-2c.24-.14.55-.06.68.18.14.24.06.55-.18.68zm4.75.07c-.1 0-.2-.03-.27-.08l-8.5-5.5c-.23-.15-.3-.46-.15-.7.15-.22.46-.3.7-.14L12 13.4l8.23-5.32c.23-.15.54-.08.7.15.14.23.07.54-.16.7l-8.5 5.5c-.08.04-.17.07-.27.07zm8.93 1.75c-.1.16-.26.25-.43.25-.08 0-.17-.02-.25-.07l-3.5-2c-.24-.13-.32-.44-.18-.68s.44-.32.68-.18l3.5 2c.24.13.32.44.18.68z"/></svg>
		</div>
		</div>
	</a>	

	<!-- Sharingbutton Reddit -->
	<a class="resp-sharing-button__link" href="https://reddit.com/submit/?url=`+CurrentURL+`&amp;resubmit=true&amp;title=PanoPuzzle: `+CurrentTitle+`" target="_blank" rel="noopener" aria-label="">
		<div class="resp-sharing-button resp-sharing-button--reddit resp-sharing-button--small"><div aria-hidden="true" class="resp-sharing-button__icon resp-sharing-button__icon--solid">
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M24 11.5c0-1.65-1.35-3-3-3-.96 0-1.86.48-2.42 1.24-1.64-1-3.75-1.64-6.07-1.72.08-1.1.4-3.05 1.52-3.7.72-.4 1.73-.24 3 .5C17.2 6.3 18.46 7.5 20 7.5c1.65 0 3-1.35 3-3s-1.35-3-3-3c-1.38 0-2.54.94-2.88 2.22-1.43-.72-2.64-.8-3.6-.25-1.64.94-1.95 3.47-2 4.55-2.33.08-4.45.7-6.1 1.72C4.86 8.98 3.96 8.5 3 8.5c-1.65 0-3 1.35-3 3 0 1.32.84 2.44 2.05 2.84-.03.22-.05.44-.05.66 0 3.86 4.5 7 10 7s10-3.14 10-7c0-.22-.02-.44-.05-.66 1.2-.4 2.05-1.54 2.05-2.84zM2.3 13.37C1.5 13.07 1 12.35 1 11.5c0-1.1.9-2 2-2 .64 0 1.22.32 1.6.82-1.1.85-1.92 1.9-2.3 3.05zm3.7.13c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9.8 4.8c-1.08.63-2.42.96-3.8.96-1.4 0-2.74-.34-3.8-.95-.24-.13-.32-.44-.2-.68.15-.24.46-.32.7-.18 1.83 1.06 4.76 1.06 6.6 0 .23-.13.53-.05.67.2.14.23.06.54-.18.67zm.2-2.8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm5.7-2.13c-.38-1.16-1.2-2.2-2.3-3.05.38-.5.97-.82 1.6-.82 1.1 0 2 .9 2 2 0 .84-.53 1.57-1.3 1.87z"/></svg>
		</div>
		</div>
	</a>

	<!-- Sharingbutton XING -->
	<a class="resp-sharing-button__link" href="https://www.xing.com/app/user?op=share;url=`+CurrentURL+`;title=`+CurrentTitle+`" target="_blank" rel="noopener" aria-label="">
		<div class="resp-sharing-button resp-sharing-button--xing resp-sharing-button--small"><div aria-hidden="true" class="resp-sharing-button__icon resp-sharing-button__icon--solid">
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10.2 9.7l-3-5.4C7.2 4 7 4 6.8 4h-5c-.3 0-.4 0-.5.2v.5L4 10 .4 16v.5c0 .2.2.3.4.3h5c.3 0 .4 0 .5-.2l4-6.6v-.5zM24 .2l-.5-.2H18s-.2 0-.3.3l-8 14v.4l5.2 9c0 .2 0 .3.3.3h5.4s.3 0 .4-.2c.2-.2.2-.4 0-.5l-5-8.8L24 .7V.2z"/></svg>
		</div>
		</div>
	</a>

	<!-- Sharingbutton VK -->
	<a class="resp-sharing-button__link" href="http://vk.com/share.php?title=`+CurrentTitle+`&amp;url=`+CurrentURL+`" target="_blank" rel="noopener" aria-label="">
		<div class="resp-sharing-button resp-sharing-button--vk resp-sharing-button--small"><div aria-hidden="true" class="resp-sharing-button__icon resp-sharing-button__icon--solid">
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21.547 7h-3.29a.743.743 0 0 0-.655.392s-1.312 2.416-1.734 3.23C14.734 12.813 14 12.126 14 11.11V7.603A1.104 1.104 0 0 0 12.896 6.5h-2.474a1.982 1.982 0 0 0-1.75.813s1.255-.204 1.255 1.49c0 .42.022 1.626.04 2.64a.73.73 0 0 1-1.272.503 21.54 21.54 0 0 1-2.498-4.543.693.693 0 0 0-.63-.403h-2.99a.508.508 0 0 0-.48.685C3.005 10.175 6.918 18 11.38 18h1.878a.742.742 0 0 0 .742-.742v-1.135a.73.73 0 0 1 1.23-.53l2.247 2.112a1.09 1.09 0 0 0 .746.295h2.953c1.424 0 1.424-.988.647-1.753-.546-.538-2.518-2.617-2.518-2.617a1.02 1.02 0 0 1-.078-1.323c.637-.84 1.68-2.212 2.122-2.8.603-.804 1.697-2.507.197-2.507z"/></svg>
		</div>
		</div>
	</a>

	<!-- Sharingbutton WhatsApp -->
	<a class="resp-sharing-button__link" href="whatsapp://send?text=`+CurrentTitle+`%20`+CurrentURL+`" target="_blank" rel="noopener" aria-label="">
		<div class="resp-sharing-button resp-sharing-button--whatsapp resp-sharing-button--small"><div aria-hidden="true" class="resp-sharing-button__icon resp-sharing-button__icon--solid">
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20.1 3.9C17.9 1.7 15 .5 12 .5 5.8.5.7 5.6.7 11.9c0 2 .5 3.9 1.5 5.6L.6 23.4l6-1.6c1.6.9 3.5 1.3 5.4 1.3 6.3 0 11.4-5.1 11.4-11.4-.1-2.8-1.2-5.7-3.3-7.8zM12 21.4c-1.7 0-3.3-.5-4.8-1.3l-.4-.2-3.5 1 1-3.4L4 17c-1-1.5-1.4-3.2-1.4-5.1 0-5.2 4.2-9.4 9.4-9.4 2.5 0 4.9 1 6.7 2.8 1.8 1.8 2.8 4.2 2.8 6.7-.1 5.2-4.3 9.4-9.5 9.4zm5.1-7.1c-.3-.1-1.7-.9-1.9-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.1-.2.2-.3.2-.6.1s-1.2-.5-2.3-1.4c-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6s.3-.3.4-.5c.2-.1.3-.3.4-.5.1-.2 0-.4 0-.5C10 9 9.3 7.6 9 7c-.1-.4-.4-.3-.5-.3h-.6s-.4.1-.7.3c-.3.3-1 1-1 2.4s1 2.8 1.1 3c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.7-.7 1.9-1.3.2-.7.2-1.2.2-1.3-.1-.3-.3-.4-.6-.5z"/></svg>
		</div>
		</div>
	</a>
	
	<a class="form-group">
		<input class="form-field" width="400" type="text" value=`+window.location.href+` id="myInput">
		<button class="copybutton" onclick="myCopyFunction()">Copy</button>
	</a>
	`			
	document.getElementById("shareDiv").innerHTML = mySharButtons;

}

function myCopyFunction() {
	var copyText = document.getElementById("myInput");
	copyText.select();
	copyText.setSelectionRange(0, 99999)
	document.execCommand("copy");
  }

function CloseShareDiv(event){
	myCopyFunction();
	window.history.pushState({},'',baseURL+'?config='+whichConfig+'&pano='+whichPano+'&hh='+howDifficult);
	document.getElementById("shareDiv").style.visibility = "hidden";		
	document.getElementById("close-share").style.visibility = "hidden";	
}
