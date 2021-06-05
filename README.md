## Info

hackrew is a framework for making character creator/dressup game applets a la [picrew](https://picrew.me/). You can check out an online demo [here](https://ksadov.github.io/hackrew/), or see a more complex version on [Neocities](https://cherrvak.neocities.org/furrycreator/index.html). To make your own character creator, fork this repo or download the files and follow the instructions below.

## Instructions

### Step 1: start a web server

The applet won't run correctly unless it's launched from a server. To launch it from your own machine, cd into the hackrew folder, run ./serve.sh (you'll need [Python 3 installed on your machine](https://www.python.org/downloads/)) from the command line and navigate to [http://localhost:8000/](http://localhost:8000/) in your browser. Once you're done developing your character creator, you can host it on a remote server, like Neocities or Github Pages.

### Step 2: specify your parts
The character creator applet's visual components are comprised of "parts" (ex: "body", "ears", "tail", "accessories"), which have varieties called "items" (ex: the items for ears are "small" and "big"). Each item is represented by a .png image with a transparent background. The applet allows the user to create different characters by layering different item .pngs on top of each other. 

Parts are listed in parts.json in the order in which they're rendered: parts near the bottom are visually layered on top of parts near the top. Parts have the following fields:

- `"folder"`: the name of the folder that will contain the part's visual assets
- `"items"`: the names of the items belonging to the part
- `"colorMode"`: Can be `"fill"`, `"multiply"`, `"manual"` or `null`. See Step 3 for details.
- `"colors"`: 6-character strings containing the the hexcodes of colors.
- `"noneAllowed"`: `true` if this part is optional, false otherwise

Ex: 
```
{ "folder": "ears",
      "items": ["small", "big"],
      "colorMode": "manual",
      "colors": ["FFFFFF", "FFBD6C", "BBDE49"],
      "noneAllowed": true
    }
```
### Step 3: create visual assets

All item .png files must have the same dimensions. To ensure that the items line up correctly when layered, I recommend drawing items on different layers of the same file in a digital art program like Gimp or Procreate, then saving each layer seperately as a .png.

Each part can come in multiple colors (ex: ears can be white, orange or green). For every part `part` and item `item`, the folder `imagemakerAssets/part` must contain a file named `item.png`. This file will represent the part in the part select menu. If the part has no color options, this file will also be used as an image for the character creator.

If a part has color options, then the `"colorMode"` field determines whether the item files for each color are  manually or automatically generated.

To manually create color variants for each item of a part `part`, set `"colorMode`" to `"manual"` and for each item `item` and each color of hexcode `"XXXXXX"`, create a .png `imagemakerAssets/part/item_XXXXXX.png` depicting `item` in color `XXXXXX`.

To generate color variants automatically, you'll need to run the Python script `generate_colored_images.py`. The script uses files of the form `"imagemakerAssets/part/item.png`" as templates to generate colored versions of each item. If a part has `"colorMode"` `"fill"`, the script fills the template's pixels of RGB value `(123, 123, 123)` with the desired color, preserving alpha. If a part has `"colorMode"` `"multiply"`, the script treats the template as an alpha-preserving multiply layer over the desired color.

To run the Python script, you'll need [pipenv](https://pypi.org/project/pipenv/) installed and on your $PATH. Then from within the hackrew directory:
```
pipenv install
pipenv run python3 generate_colored_images.py

```
The script will take a while to run, but at the end you'll have your color variant image files in the correct folders.

### Step 4: edit the UI
To change the colors and graphics of the UI, edit the variables at the top of index.css.

### Step 5: host your applet

The only files that you need to host your applet are index.html, index.css imagemaker.js, and the imagemakerAssets folder. To host on Github pages, fork this repo, customize the files, and follow the intrucutions [here](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).

To host on Neocities, make a new folder to contain your project (in my [example page](https://cherrvak.neocities.org/furrycreator/index.html), the folder is called "furrycreator"). Place the files index.html, index.css and imagemaker.js in this folder. Then place the folder imagemakerAssets in the same directory, but be careful to preserve the subfolder structure: the Neocities drag-and-drop GUI won't preserve the seperate folders for each part, which will break the code, so you're better off making a folder called imagemakerAssets and dragging-and-dropping in each part folder one-by-one. Then your completed applet will be on the page `https://your-neocities-page.neocities.org/your-folder-name/` (ex: https://cherrvak.neocities.org/furrycreator/)

## TODO
- Add item shift button or draggable items?