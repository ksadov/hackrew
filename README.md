Instructions

To run:

The applet won't run correctly unless it's launched from a server. To launch it from your own machine, run ./serve.sh and navigate to http://localhost:8000/ in your browser.

To edit the assets:
Parts are listed in the variable `parts` at the top of imagemaker.js. To add a part, specify the name of the part in the "folder" field, the variaties of that part in the "items" field, the color options in "colors" and either `true` or `false` for noneAllowed depending on whether you want to allow the user to have none of that part. Ex:

	{ folder: "ears",
	  items: ["small", "big"],
	  colors: ["#FFFFFF", "#FFBD6C", "#BBDE49"],
	  noneAllowed: true
	},

Then create a subfolder in imagemaker_assets whose name is the value of the `folder` field (ex: imagemaker_assets/ears). Add a file named icon.png to the folder: this will be the icon of the part in the part select menu. For every item in the `items` field and every color in color, add a png image of that item with a filename of the form {items[n]}_{m}.png, where items[n] is the item at index n in the array `items` and `m` is an index of the color array. (ex: imagemaker_assets/ears/small_0.png is a png of small ears in the color #FFFFFF, imagemaker_assets/ears/big_2 is a png of big ears in the color "#BBDE49"). If the colors field is an empty array, then filenames should just have the form {items[n}.png (ex: imagemaker_assets/accessories/bow.png, imagemaker_assets/accessories/crown.png).

To edit the UI:
To change the colors and graphics of the UI, edit the variables at the top of index.css.