window.addEventListener('load', function(ev) {
    let parts = [];
    // code below this line controls functionality
    // dw about if you're just editing visual assets

    /* r, g, b values of color that "fill" color mode fills in with color*/
    const fillColor = [123, 123, 123];
    
    /* relative path to the folder containing part folders */
    const assetsPath = "imagemakerAssets/"
    
    // DOM Elements
    const canvas = document.getElementById("my-canvas-object");
    const context = canvas.getContext('2d');

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    
    const randomButton = document.getElementById("random_button");
    const infoButton = document.getElementById("info_button");
    const paletteButton = document.getElementById("palette_button");
    const itemsButton = document.getElementById("items_button");
    const saveButton = document.getElementById("save_button");
    /* 1d array of part select button DOM elements */
    const partsElements = [];
    /* 2d array of item select button DOM elements */
    const itemsElements = [];

    /* Render layers to this 1st and then canvas so that images render all at 
       once instead of one layer at a time */
    const workingCanvas = document.createElement('canvas');
    workingCanvas.height = HEIGHT;
    workingCanvas.width = WIDTH;
    const workingContext = workingCanvas.getContext('2d');

    // global state variables
    /* Is the extra info screen currently visible? */
    let infoVisible = false;
    /* Is the palette select menu visible and item select menu invisible? */
    let paletteVisible = false;  
    /* Index of part whose menu is currently displayed */
    let selectedPart = 0;
    /* 1d array of colors where selectedColors[i] is the color selected for part i */
    let selectedColors = []  
    /* 1d array of indices of items currently selected, sans _{colorIndex} suffix, 
       where selectedItemNames[i] is the selected item of part i*/
    let selectedItemIndex = []

    const layerCanvases = [];
    
    init();

    async function init() {
	await initParts();
	initButtons();
	initCanvases()
	await initArrays();
	initPalette();
	await initItemFunctions();
	await randomize();
	await updateSelectedPart(0);
    }

    async function initParts (data) {
	const response = await fetch("./parts.json");
	const json = await response.json();
	parts = json.parts;
    }
    
    /**
     * Assign canvases to list of layer canvases
     */
    function initCanvases() {
	for (let partIdx = 0; partIdx < parts.length; partIdx++) {
	    let cnv = document.createElement('canvas');
	    cnv.height = HEIGHT;
	    cnv.width = WIDTH;
	    layerCanvases.push(cnv);
	}
    }

    /**
     * Assign functions to buttons.
     */
    function initButtons() {
	randomButton.addEventListener('click', randomize);
	infoButton.addEventListener('click', toggleInfo);
	paletteButton.addEventListener('click', togglePalette);
	itemsButton.addEventListener('click', toggleItems);
	return null;
    }

    /**
     * Initialize partsElements, itemsElements
     */
    async function initArrays() {
	initPartsElements();
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
	    paletteButton.style.display = "none";
	}
	else {
	    paletteButton.style.display = "inline-flex";
	}
	updatePalette();
	toggleItems();
	return null;
    }
    
    /**
     * Display image with randomly selected items
     */ 
    async function randomize() {
	for (let i = 0; i < parts.length; i++) {
	    let itemRange = parts[i].items.length;
	    let itemIndex = Math.floor(Math.random() * itemRange);
	    let colorRange = parts[i].colors.length;
	    let colorIndex = Math.floor(Math.random() * colorRange);
	    selectedColors[i] = colorIndex;
	    selectedItemIndex[i] = itemIndex;
	    for (j = 0; j < itemRange; j++) {
		if (j == itemIndex) {
		    itemsElements[i][j].classList.add("selected");
		}
		else {
		    itemsElements[i][j].classList.remove("selected");
		}
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
	clearCanvas(workingCanvas);
	for (let partId = 0; partId < parts.length; partId++) {
	    clearCanvas(layerCanvases[partId]);
	    if (selectedItemIndex[partId] !== null) {
		await imageFromIndex(partId, selectedItemIndex[partId], selectedColors[partId]);
	    }
	    workingContext.drawImage(layerCanvases[partId], 0, 0);
	}
	clearCanvas(canvas);
	context.drawImage(workingCanvas, 0, 0);
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
	    partIcon.src = assetsPath + parts[i].folder + "/icon.png";
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
		noneButtonIcon.src = assetsPath + "none_button.png";
		noneButton.appendChild(noneButtonIcon);
		document.getElementById("itemlist_list").appendChild(noneButton);
		noneButton.style.display = "none";
		itemsElements[i][0] = noneButton;
 	    }
	    let mode = parts[i].colorMode;
	    let pngSuffix = (mode == "fromPng") ? "_0" : "";
	    for (let j = 0; j < parts[i].items.length; j++) {
		let item = document.createElement('li');
		let itemIcon = document.createElement('img');
		itemIcon.id = "icon_" + i.toString() + "_" + j.toString();
		itemIcon.src = (assetsPath +
				parts[i].folder + "/" +
				parts[i].items[j] + pngSuffix + ".png");
		item.appendChild(itemIcon);
		item.id = "item_" + i.toString() + "_" + j.toString();
		item.style.display = "none";
		document.getElementById("itemlist_list").appendChild(item);
		itemsElements[i][j + Number(parts[i].noneAllowed)] = item;
	    }
	}
	return null;
     }

    function clearCanvas(canvas) {
	return (canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height));
    }

    /**
     * Update UI to visibly select a parts[partId].items[itemId] and render it to the canvas
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
	let selectedNone = (parts[partId].noneAllowed && itemId == 0);
	if (selectedNone) {
	    selectedItemIndex[partId] = null;
	}
	else {	    
	    selectedItemIndex[partId] = itemId - Number(parts[partId].noneAllowed);
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
     * @path {string} the path to the Image source .png
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
	    infoButton.textContent = "?";
	}
	else {
	    infoWrap.style.display = "block";
	    infoVisible = true;
	    infoButton.textContent = "X";
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
	if (selectedItemIndex[partId]) {
	    await renderLayerStack();
	}
	return null;
    }

    function drawLayer(template, color, multiply, partId) {
	clearCanvas(layerCanvases[partId]);
	ctx = layerCanvases[partId].getContext('2d');
	ctx.drawImage(template, 0, 0);
	let templateImg = ctx.getImageData(0, 0, WIDTH, HEIGHT);
	let templateData = templateImg.data;
	let colorR = parseInt("0x" + color.substring(1, 3));
	let colorG = parseInt("0x" + color.substring(3, 5));
	let colorB = parseInt("0x" + color.substring(5, 7));		
	for (let pixId = 0; pixId < template.width * template.height; pixId++) {	    
	    if (multiply) {
		templateData[4 * pixId] = (templateData[4 * pixId]/255) * (colorR/255) * 255;
		templateData[4 * pixId + 1] = (templateData[4 * pixId + 1]/255) * (colorG/255) * 255;
		templateData[4 * pixId + 2] = (templateData[4 * pixId + 2]/255) * (colorB/255) * 255;
	    }
	    else {
		if (templateData[4 * pixId] === fillColor[0] &
		    templateData[4 * pixId + 1] === fillColor[1] &
		    templateData[4 * pixId + 2] === fillColor[2]) {
		    templateData[4 * pixId] = colorR;
		    templateData[4 * pixId + 1] = colorG;
		    templateData[4 * pixId + 2] = colorB;
		}
	    }
	}
	ctx.putImageData(templateImg, 0, 0);
    }
    
    async function imageFromIndex(partIndex, itemIndex, colorIndex) {
	let mode = parts[partIndex].colorMode;
	if (mode == "fill" || mode == "multiply") {
	    let templatePath = (assetsPath +
				parts[partIndex].folder + "/" +
				parts[partIndex].items[itemIndex] + ".png");
	    let template = await(loadImage(templatePath));
	    drawLayer(template, parts[partIndex].colors[colorIndex], mode === "multiply", partIndex);
	}
	else {
	    
	    let imgPath = (parts[partIndex].colors.length > 0)
		?
		(assetsPath +
		 parts[partIndex].folder + "/" +
		 parts[partIndex].items[itemIndex] + "_" +
		 colorIndex + 
		 ".png")
		:
		(assetsPath +
		 parts[partIndex].folder + "/" +
		 parts[partIndex].items[itemIndex] +
		 ".png")
		;
	    let img = await(loadImage(imgPath));
	    clearCanvas(layerCanvases[partIndex]);
	    ctx = layerCanvases[partIndex].getContext('2d');
	    ctx.drawImage(img, 0, 0); 
	}
    } 
} ,false);
