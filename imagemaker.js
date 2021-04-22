window.addEventListener('load', function(ev) {

    /* relative path to the folder containing part folders */
    const assets_path = "assets/"
    
    const parts = [
	{ folder: "body",
	  items: ["sleek", "fluffy"],
	  colors: ["#FFFFFF", "#FFBD6C"],
	  noneAllowed: false
	},
	{ folder: "ears",
	  items: ["small", "big"],
	  colors: ["#FFFFFF", "#FFBD6C", "#BBDE49"],
	  noneAllowed: true
	},
	{ folder: "tail",
	  items: ["long", "short"],
	  colors: ["#FFFFFF", "#FFBD6C"],
	  noneAllowed: false,
	  moveable: false
	},
	{ folder: "accessories",
	  items: ["bow", "crown"],
	  colors: [],
	  noneAllowed: true
	}
    ];

    // code below this line controls functionality

    // DOM Elements
    const canvas = document.getElementById("my-canvas-object");
    const context = canvas.getContext('2d');
    const randomButton = document.getElementById("random_button");
    const infoButton = document.getElementById("info_button");
    const paletteButton = document.getElementById("palette_button");
    const itemsButton = document.getElementById("items_button");
    const saveButton = document.getElementById("save_button");
    /* 1d array of part select button DOM elements */
    const partsElements = [];
    /* 2d array of item select button DOM elements */
    const itemsElements = [];
    

    // global state variables
    /* Is the extra info screen currently visible? */
    let infoVisible = false;
    /* Is the palette select menu visible and item select menu invisible? */
    let paletteVisible = false;  
    /* Index of part whose menu is currently displayed */
    let selectedPart = 0;
    /* 3d array of item .png full paths where itemImages[i][j][k] is 
       part i, item (j + noneAllowed), color k and item[i][0] is null if noneAllowed*/
    const itemImages = []
    /* 1d array of Loaded Images that should be rendered on the canvas, where
       layerStack[i] is an item of part i in color selectedColors[i]*/
    const layerStack = []
    /* 1d array of colors where selectedColors[i] is the color selected for part i */
    let selectedColors = []  
    /* 1d array of full paths to items currently selected, sans _{colorIndex} suffix, 
       where selectedItemNames[i] is the selected item of part i*/
    let selectedItemNames = []
    
    init();

    async function init() {
	initButtons();
	await initArrays();
	initPalette();
	await initItemFunctions();
	await randomize();
	await updateSelectedPart(0);
    }

    /**
     * Assign functions to buttons.
     */
    function initButtons() {
	randomButton.addEventListener('click', randomize);
	info_button.addEventListener('click', toggleInfo);
	palette_button.addEventListener('click', togglePalette);
	items_button.addEventListener('click', toggleItems);
	return null;
    }

    /**
     * Initialize partsElements, itemsElements, itemImages
     */
    async function initArrays() {
	initPartsElements();
	await initItemImages();
	initItemsElements();
	return null;
    }

    /**
     * Create color select DOM elements for every part's colors
     */
    function initPalette() {
	for (let i = 0; i < parts.length; i++) {
	    for (let j = 0; j < parts[i].colors.length; j++) {
		let colorElement = document.createElement('li');
		colorElement.style.backgroundColor = parts[i].colors[j];
		colorElement.addEventListener('click', function() {
		    selectColor(i, j);
		});
		colorElement.id = "color_" + i.toString() + "_" + j.toString();
		colorElement.style.display = "none";
		document.getElementById("colorpalette_list").appendChild(colorElement);
	    }
	}
	return null;
    }

    /**
     * Update UI to visibly select a part and display that part's items
     * @param {number} partId The id of the selected part
     */
    async function updateSelectedPart(partId) {
	selectedPart = partId;
	for (let i = 0; i < parts.length; i++) {
	    if (i == partId) {		
		partsElements[i].classList.add('selected');
	    }
	    else {
		partsElements[i].classList.remove('selected');;
	    }
	    for (let j = 0; j < (parts[i].items.length + Number(parts[i].noneAllowed)); j++) {
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
	updatePalette();
	return null;
    }
    
    /**
     * Display image with randomly selected items
     */ 
    async function randomize() {
	for (let i = 0; i < parts.length; i++) {
	    let itemRange = parts[i].items.length + Number(parts[i].noneAllowed);
	    let itemIndex = Math.floor(Math.random() * itemRange);
	    let colorRange = parts[i].colors.length;
	    let colorIndex = Math.floor(Math.random() * colorRange);
	    selectedColors[i] = colorIndex;
	    let newItem = itemImages[i][itemIndex];
	    if (newItem) {
		layerStack[i] = await(newLayer(newItem[colorIndex]));
		selectedItemNames[i] = newItem[colorIndex].split('_')[0];
	    }
	    else {
		layerStack[i] = null;
		selectedItemNames[i] = null;
	    }
	    for (j = 0; j < itemRange; j++) {
		if (j == itemIndex) {
		    itemsElements[i][j].classList.add("selected");
		}
		else {
		    itemsElements[i][j].classList.remove("selected");
		}
	    }
	    if (colorRange > 0) {
		updateIcons(i, colorIndex);
	    }
	}
	await renderLayerStack();
	return null;
    }

    /**
     * Assign item select callback functions to partsElements and itemsElements members
     */   
    async function initItemFunctions() {
	for (let i = 0; i < parts.length; i++) {
	    partsElements[i].addEventListener('click', function() {
		updateSelectedPart(i);
	    });
	    for (let j = 0; j < (parts[i].items.length +  Number(parts[i].noneAllowed)); j++) {
		itemsElements[i][j].addEventListener('click', function() {
		    updateSelectedItem(i, j);
		});
	    }
	}
	return null;
    }

    /**
     * Render Images in layerStack to canvas and update save URL
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
     * Initialize partsElements 
     */
    function initPartsElements() {
	for (let i = 0; i < parts.length; i++) {	
	    let part = document.createElement('li');
	    let partIcon = document.createElement('img');
	    partIcon.src = assets_path + parts[i].folder + "/icon.png";
	    part.appendChild(partIcon);
	    part.id = "part_" + i.toString();
            document.getElementById('parts_list').appendChild(part);
	    partsElements[i] = part;
	}
	return null;
    }

    /**
     * Initialize itemsElements
     */
    function initItemsElements() {
	for (let i = 0; i < parts.length; i++) {
	    itemsElements.push([]);
	    for (let j = 0; j < parts[i].items.length; j++) {
		itemsElements[i].push(null);
	    }
	}
	for (let i = 0; i < parts.length; i++) {
	    if (parts[i].noneAllowed) {
		let noneButton = document.createElement('li');
		let noneButtonIcon = document.createElement('img');
		noneButtonIcon.src = assets_path + "none_button.png";
		noneButton.appendChild(noneButtonIcon);
		document.getElementById("itemlist_list").appendChild(noneButton);
		noneButton.style.display = "none";
		itemsElements[i][0] = noneButton;
 	    }
	    for (let j = 0; j < parts[i].items.length; j++) {
		let item = document.createElement('li');
		let itemIcon = document.createElement('img');
		itemIcon.id = "icon_" + i.toString() + "_" + j.toString();
		itemIcon.src = itemImages[i][j + Number(parts[i].noneAllowed)][0]
		item.appendChild(itemIcon);
		item.id = "item_" + i.toString() + "_" + j.toString();
		item.style.display = "none";
		document.getElementById("itemlist_list").appendChild(item);
		itemsElements[i][j + Number(parts[i].noneAllowed)] = item;
	    }
	}
	return null;
     }

    /**
     * Initialize itemImages
     *
     */
    async function initItemImages() {
	for (let i = 0; i < parts.length; i++) {
	    let selectableCount =  parts[i].items.length + Number(parts[i].noneAllowed);
	    itemImages.push([]);
	    for (let j = 0; j < selectableCount; j++) {
		itemImages[i].push([]);
		for (let k = 0; k < parts[i].colors.length; k++) {
		    itemImages[i][j].push(null);
		}
	    }
	}
	for (let i = 0; i < parts.length; i++) {
	    if (parts[i].noneAllowed) {
		itemImages[i][0] = null;
	    }
	    for (let j = 0; j < parts[i].items.length; j++) {
		let item_index = j + Number(parts[i].noneAllowed);
		if (parts[i].colors.length === 0) {
		    itemImages[i][item_index][0] = (assets_path +
						    parts[i].folder + "/" +
						    parts[i].items[j] + ".png");
		}
		else {
		    for (let k = 0; k < parts[i].colors.length; k++) {
			itemImages[i][item_index][k] = (assets_path +
							parts[i].folder + "/" +
							parts[i].items[j] + "_" +
							k + ".png");
		    }
		}
	    }
	}
	return null;
    }

    async function clearCanvas() {
	return (context.clearRect(0, 0, canvas.width, canvas.height));
    }

    /**
     * Update UI to visibly select a part[partId].items[itemId] and render it to the canvas
     */
    async function updateSelectedItem(partId, itemId) {
	for (let j = 0; j < (parts[partId].items.length +  Number(parts[partId].noneAllowed)); j++) {
	    if (j == itemId) {
		itemsElements[partId][j].classList.add("selected");
	    }
	    else {
		itemsElements[partId][j].classList.remove("selected");
	    }
	}
	let selectedNone = (itemImages[partId][itemId] == null);
	if (selectedNone) {
	    layerStack[partId] = null;
	    selectedItemNames[partId] = null;
	}
	else {
	    let newImg = itemImages[partId][itemId][selectedColors[partId]];
	    let newSelLayer = await(newLayer(newImg));
	    layerStack[partId] = newSelLayer;
	    selectedItemNames[partId] = newImg.split('_')[0];
	}
	await renderLayerStack();
	return null;
    }
    
    /**
     * Update download save button with latest version of the canvas
     */ 
    async function updateSave() {
	save.href = canvas.toDataURL("image/png");
	return null;
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

    /**
     * Display info menu if it's visible, hide it if it's invisible
     */
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

    /**
     * Display palette of selectedPart
     */
    function updatePalette() {
	for (let i = 0; i < parts.length; i++) {
	    for (let j = 0; j < parts[i].colors.length; j++) {
		if (i === selectedPart) {		
		    document.getElementById("color_" + i.toString()
					    + "_" + j.toString()).style.display = "inline-block";
		}
		else {
		    document.getElementById("color_" + i.toString()
					    + "_" + j.toString()).style.display = "none";
		}
	    }
	}
    }

    /**
     * Display palette menu, hide item menu
     */
    function togglePalette() {
	paletteVisible = true;
	document.getElementById("imagemaker_colorpalette").style.display = "flex";
	document.getElementById("imagemaker_itemlist").style.display = "none";	
    }

    /**
     * Display item menu, hide palette menu
     */
    function toggleItems() {
	paletteVisible = false;
	document.getElementById("imagemaker_colorpalette").style.display = "none";
	document.getElementById("imagemaker_itemlist").style.display = "flex";
    }

    /**
     * Change the color of the item selected for part[partId] to part[partId].colors[colorId]
     */
    async function selectColor(partId, colorId) {
	selectedColors[partId] = colorId;
	if (selectedItemNames[partId]) {
	    let newImgFile = selectedItemNames[partId] + "_" + colorId.toString() + ".png";
	    let colorLayer = await newLayer(newImgFile);
	    layerStack[partId] = colorLayer;
	    await renderLayerStack();
	}
	await updateIcons(partId, colorId);
	return null;
    }

    /**
     * Change the item icons for parts[partId] to parts[partId].colors[colorId]
     */
    async function updateIcons(partId, colorId) {
	for (let j = 0; j < parts[partId].items.length; j++) {
	    let itemId = j + Number(parts[partId].noneAllowed);
	    let partIcon = document.getElementById("icon_" + partId.toString() + "_" + j.toString());
	    let newIconSrc = itemImages[partId][itemId][colorId];
	    partIcon.src = newIconSrc;
	}
    }


} ,false);
