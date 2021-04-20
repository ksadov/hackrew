window.addEventListener('load', function(ev) {

    /* relative path to the folder containing part folders */
    const assets_path = "assets/"
    
    const parts = [
	{ folder: "body",
	  items: ["sleek", "fluffy"],
	  colors: ["FFFFFF", "FFBD6C"],
	  none_allowed: false
	},
	{ folder: "ears",
	  items: ["small", "big"],
	  colors: ["FFFFFF", "FFBD6C"],
	  none_allowed: true
	},
	{ folder: "tail",
	  items: ["long", "short"],
	  colors: ["FFFFFF", "FFBD6C"],
	  none_allowed: false,
	  moveable: false
	},
	{ folder: "accessories",
	  items: ["bow", "crown"],
	  colors: [],
	  none_allowed: true
	}
    ];

    // code below this line controls functionality
    // you probably don't want to edit it
    
    const canvas = document.getElementById("my-canvas-object");
    const context = canvas.getContext('2d');
    
    const layerStack = [];

    /* Array of part select button DOM elements */
    const partsElements = [];
    /* Array of item select button DOM elements */
    const itemsElements = [];
    /* Array of item .png paths */
    const itemImages = [];

    const saveButton = document.getElementById("save_button");
    
    const randomButton = document.getElementById("random_button");
    randomButton.addEventListener('click', randomize);

    let infoVisible = false;
    const infoButton = document.getElementById("info_button");
    info_button.addEventListener('click', toggleInfo);
    
    init();

    async function init() {
	await initArrays();
	await renderLayerStack(updateSave);
	await updateSelectedPart(0);
	initItemFunctions();
	await randomize();
    }

    /**
     * Initialize partsElements, itemsElements, itemImages
     */
    async function initArrays() {

	for (let i = 0; i < parts.length; i++) {	
	    let part = document.createElement('li');
	    let partIcon = document.createElement('img');
            partIcon.src = assets_path + parts[i].folder + "/icon.png";
	    part.appendChild(partIcon);
	    part.id = "part_" + i.toString();
            document.getElementById('parts_list').appendChild(part);
	    partsElements.push(part);

	    if (parts[i].none_allowed) {
		let noneButton = document.createElement('li');
		let noneButtonIcon = document.createElement('img');
		noneButtonIcon.src = assets_path + "none_button.png";
		noneButton.appendChild(noneButtonIcon);
		document.getElementById("itemlist_list").appendChild(noneButton);
		noneButton.style.display = "none";
		itemsElements.push([noneButton]);
		itemImages.push([null]);
 	    }
	    else {
		itemsElements.push([]);
		itemImages.push([]);
	    }
	    for (let j = 0; j < parts[i].items.length; j++) {
		let item = document.createElement('li');
		let itemIcon = document.createElement('img');
		if (parts[i].colors.length > 0) {
		    itemIcon.src = (assets_path + parts[i].folder + "/"
				     + parts[i].items[j] + "_0.png");
		}
		else {
		    itemIcon.src = (assets_path + parts[i].folder + "/" +
				     parts[i].items[j] + ".png");
		}
		item.appendChild(itemIcon);
		item.id = "item_" + i.toString() + "_" + j.toString();
		item.style.display = "none";
		document.getElementById("itemlist_list").appendChild(item);
		itemsElements[i].push(item);
		itemImages[i].push(itemIcon.src);
	    }
	}
	return null;
    }
    
    /**
     * Update UI to visibly select a part and display that part's items
     * @param {number} partId The id of the selected part
     */
    async function updateSelectedPart(partId) {
	for (let i = 0; i < parts.length; i++) {
	    if (i == partId) {		
		partsElements[i].classList.add('selected');
	    }
	    else {
		partsElements[i].classList.remove('selected');;
	    }
	    for (let j = 0; j < (parts[i].items.length + Number(parts[i].none_allowed)); j++) {
		if (i == partId) {
		    itemsElements[i][j].style.display = "inline-flex";		
		}
		else {
		    itemsElements[i][j].style.display = "none";
		}
 	    }
	}
	if (parts[partId].colors.length === 0) {
	    document.getElementById("palette_button").style.display = "none";
	}
	else {
	    document.getElementById("palette_button").style.display = "inline-flex";
	}
	return null;
    }

    async function clearCanvas() {
	return (context.clearRect(0, 0, canvas.width, canvas.height));
    }

    /**
     * Render Images in layerStack to canvas and update save URL
     *
     */
    async function renderLayerStack() {	
	await clearCanvas();
	for (let layer = 0; layer < layerStack.length; layer++) {
	    if (layerStack[layer]) {
		context.drawImage(layerStack[layer], 0, 0);
	    }
	}
	await updateSave();
	return null;
    }

    /**
     * Update UI to visibly select an item and render it to the canvas
     *
     * @param partId id of the part that the selected item belongs to
     * @param itemId id of the selected item
     */
    async function updateSelectedItem(partId, itemId) {
	for (let j = 0; j < (parts[partId].items.length +  Number(parts[partId].none_allowed)); j++) {
	    if (j == itemId) {
		itemsElements[partId][j].classList.add("selected");
	    }
	    else {
		itemsElements[partId][j].classList.remove("selected");
	    }
	}
	if (itemImages[partId][itemId] !== null) {
	    let new_layer = await(newLayer(itemImages[partId][itemId]));
	    layerStack[partId] = new_layer;	    
	}
	else {
	    layerStack[partId] = null;
	}
	renderLayerStack();
	return null;
    }
    
    /**
     * Assign item select callback functions to part and item buttons
     */   
    async function initItemFunctions() {
	for (let i = 0; i < parts.length; i++) {
	    partsElements[i].addEventListener('click', function() {
		updateSelectedPart(i);
	    });
	    for (let j = 0; j < (parts[i].items.length +  Number(parts[i].none_allowed)); j++) {
		itemsElements[i][j].addEventListener('click', function() {
		    updateSelectedItem(i, j);
		});
	    }
	}
	return null;
    }

    /* Initialize */
    async function initUiImgs () {
	
    }
    
    /**
     * Update download save button with latest version of the canvas
     */ 
    async function updateSave() {
	save.href = canvas.toDataURL("image/png");
    }    

    /**
     * Display image with randomly selected items
     */ 
    async function randomize() {
	for (i = 0; i < parts.length; i++) {
	    let itemRange = parts[i].items.length + Number(parts[i].none_allowed);
	    let itemIndex = Math.floor(Math.random() * itemRange);
	    layerStack[i] = await(newLayer(itemImages[i][itemIndex]));
	    for (j = 0; j < itemRange; j++) {
		if (j == itemIndex) {
		    itemsElements[i][j].classList.add("selected");
		}
		else {
		    itemsElements[i][j].classList.remove("selected");
		}
	    }
	}
	renderLayerStack();
    }        

    /**
     * Create a new Image from a path
     *
     * @image {string} the path to the Image source .png
     */ 
    async function newLayer(image) {
	let myLayer;
	if (image === null) {
	    myLayer = null;
	}
	else {
	    myLayer = await(loadImage(image));
	}
	return myLayer;
    }

    /**
     * Force newLayer to wait until an image is fully loaded before assigning it to layerStack
     *
     * @image {string} the path to the Image source .png
     */
    function loadImage(path) {
        return new  Promise(resolve => {
            const image = new Image();
            image.addEventListener('load', () => {
                resolve(image);
            });
            image.src = path; 
        });
    }

    function toggleInfo() {
	let infoWrap = document.getElementById("info_wrap");
	if (infoVisible) {
	    infoWrap.style.display = "none";
	    infoVisible = false;
	}
	else {
	    infoWrap.style.display = "block";
	    infoVisible = true;
	}
    }
   
} ,false);

