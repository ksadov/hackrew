## Info

hackrew is a framework for making character creator/dressup game applets a la [picrew](https://picrew.me/). To make your own character creator, fork this repo or download the files and follow the instructions below.

## Instructions

### Step 1: start a web server

The applet won't run correctly unless it's launched from a server. To launch it from your own machine, cd into the hackrew folder, run ./serve.sh (you'll need [Python 3 installed on your machine](https://www.python.org/downloads/)) from the command line and navigate to [http://localhost:8000/](http://localhost:8000/) in your browser. Once you're done developing your character creator, you can host it on a remote server, like Neocities or Github Pages.

### Step 2: create visual assets

The character creator applet's visual components are comprised of "parts" (ex: "body", "ears", "tail", "accessories"), which have varieties called "items" (ex: the items for ears are "small" and "big"). Each item is represented by a .png image with a transparent background. The applet allows the user to create different characters by layering different item .pngs on top of each other.

All item .png files must have the same dimensions. To ensure that the items line up correctly when layered, I recommend drawing items on different layers of the same file in a digital art program like Gimp or Procreate, then saving each layer seperately as a .png. Each part can come in multiple colors (ex: ears can be white, orange or green). You'll need to create a seperate .png of each item in each color that you choose to assign a part. 

### Step 3: integrate assets into the code
First, edit the `width` and `height` fields of the `"my-canvas-object"` element on line 18 of the file index.html to reflect the actual size of your item .png files in pixels.

Parts are listed in the variable `parts` at the top of imagemaker.js in the order in which they're rendered: parts near the bottom are visually layered on top of parts near the top. To add a part, specify the name of the part in the `folder` field, the items of that part in the `items` field, the hexcodes of the color options in `colors` and either `true` or `false` for `noneAllowed` depending on whether you want to allow the character to have none of that part. Ex:
```
	{ folder: "ears",
	  items: ["small", "big"],
	  colors: ["#FFFFFF", "#FFBD6C", "#BBDE49"],
	  noneAllowed: true
	},
```
Then create a subfolder in imagemaker_assets whose name is the value of the `folder` field (ex: imagemaker_assets/ears). Add an image file named icon.png to the folder: this will be the icon of the part in the part select menu. For every item in the `items` field and every color in color, add a png image of that item with a filename of the form {items[n]}_{m}.png, where items[n] is the item at index n in the array `items` and `m` is an index of the color array. (ex: imagemaker_assets/ears/small_0.png is a png of small ears in the color #FFFFFF, imagemaker_assets/ears/big_2 is a png of big ears in the color "#BBDE49"). If the colors field is an empty array, then filenames should just have the form {items[n}.png (ex: imagemaker_assets/accessories/bow.png, imagemaker_assets/accessories/crown.png).

### Step 4: edit the UI
To change the colors and graphics of the UI, edit the variables at the top of index.css.

## TODO
Expand and revise Instructions
Try hosting on Neocities, maybe add a section with instructions for that
Add item shift button or draggable items?
