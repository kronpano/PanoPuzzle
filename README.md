# PanoPuzzle
<img src="screenshots/PanoPuzzleLogo_4.png" align="right" width="320" height="320">
<br>
A 360 panoramic puzzle game - create longer interactions with your 360 images
<br><br>
The game subdivides the cubefaces of a 360 panorama and rotates some of them.<br> 
It is your job to find and rotate all the wrongly rotated ones and restore the 360 panorama to it's original glory.

<br><br><br><br><br><br>
When starting the game it will look like this
<img src="screenshots/MainInfo.jpg" width=1000><br>
This gives you all the information you need to play the game - just look around by dragging the panoramic image with the finger/mouse or move your mobile device around and click/tap on a tile to rotate it until all the tiles are pointing in the right direction.<br>
Some settings can be changed, puzzles can be selected directly and puzzle categories can be changed by clicking/tapping the settings cog-icon at the bottom left of the screen which will open up a small settings panel.
<img src="screenshots/SettingsAndCollections.jpg" width=1000><br>
The game also allows you to zoom out and solve the puzzle looking at the cube from the outside, a tile counter can be en/disabled to make it easier/harder and you can share a specific puzzle via the share button on the bottom right.
<img src="screenshots/UI2a.jpg" width=1000><br>


## Getting PanoPuzzle for your own web site

### Getting the code

--- Still working on it

### Preparing the panoramic images
The directory is the path relative to the images directory

```bash
├───images
   ├───collection2
   │   ├───pano1
   │   │       back.jpg
   │   │       bottom.jpg
   │   │       front.jpg
   │   │       left.jpg
   │   │       right.jpg
   │   │       top.jpg
   │   │
   │   └───pano2
   │           back.jpg
   │           bottom.jpg
   │           front.jpg
   │           left.jpg
   │           right.jpg
   │           top.jpg
   │
   ├───pano1
   │       back.jpg
   │       bottom.jpg
   │       front.jpg
   │       left.jpg
   │       right.jpg
   │       top.jpg
   │
   └───pano2
           back.jpg
           bottom.jpg
           front.jpg
           left.jpg
           right.jpg
           top.jpg
```

In the directory (e.g. pano1) the script expects the cube faces named back.jpg, bottom.jpg, front.jpg, left.jpg, right.jpg and top.jpg as you can see in the directory tree above. The directories are specified in the <a href="https://github.com/kronpano/PanoPuzzle/blob/main/README.md#creating-and-changing-the-configuration-file">configuration file</a> 

Please create the cube faces so that they are sized to a power of 2 e.g. 1024x1024 or 2048x2048
This will prevent the script from complaining (warnings) that the texture is not a power of 2

I use PTGui to make this conversion - this allows to set the size and jpg compression - smaller files load quicker BUT you might get compression artifacts

There are also free online services you can use to convert an equirectangular image to cube faces like<br>
https://360toolkit.co/convert-spherical-equirectangular-to-cubemap<br>
or<br>
https://jaxry.github.io/panorama-to-cubemap/<br>
and free tools for download (windows)<br>
https://pragmar.com/qbit/

This conversion could be implemented in javascript as well but it would need to run every time again to convert an equirectangular input to cubemap images.
Doing it in javascript means it would use the device for the conversion which takes time/proessing power...

Doing it "offline" also gives the user the possibility to choose a jpg compression which makes the image files small enough but doesn't leave too many compression artifacts. I usually end up using a compression between 50-70 - using a higher compression for 2048x2048 files to shrink them a bit more.

### Creating and changing the configuration file

--- Still working on it

## live examples
### - over on panopuzzle.created-by.me
My PanoPuzzle - which started all of this can be seen under https://panopuzzle.created-by.me <br>
it consists of several collections of 360 panoramas

### - on GitHub to show a configuration with only one collection
Using the <a href="include/PanoPuzzle_config_1.js">PanoPuzzle_config_1.js</a> config file called by <a href="PanoPuzzleOneCollection.html">PanoPuzzleOneCollection.html</a> (at the end) the following puzzle web page was created 
https://kronpano.github.io/PanoPuzzle/PanoPuzzleOneCollection.html<br>
The configuration file has only one collection so there will be no possibility to change the collection

### - on GitHub to show a configuration with several collections
Using the <a href="include/PanoPuzzle_config_2.js">PanoPuzzle_config_2.js</a> config file called by <a href="PanoPuzzleTwoCollection.html">PanoPuzzleTwoCollection.html</a> (at the end)  the following puzzle web page was created 
https://kronpano.github.io/PanoPuzzle/PanoPuzzleTwoCollection.html<br>
The configuration file has four collections so you can choose which collection you want to play.

### - on GitHub to show all the build in subdivision patterns
Using the <a href="include/PanoPuzzle_config_grid.js">PanoPuzzle_config_grid.js</a> config file called by <a href="PanoPuzzleGridDemo.html">PanoPuzzleGridDemo.html</a>  the following puzzle web page was created 
https://kronpano.github.io/PanoPuzzle/PanoPuzzleGridDemo.html
