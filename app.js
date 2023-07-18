//GLOBAL SELECTIONS AND VARIABLES
const adjustmentPanelBtns = Array.from(document.querySelectorAll(".adjust"));
const deleteAllPalettesBtn = document.querySelector(".delete-all");
const closeAdjustment = Array.from(document.querySelectorAll(".close-adjustment")); //prettier-ignore
const closeLibraryBtn = document.querySelector(".close-library");
const closeSave = document.querySelector(".close-save");
const colorDivs = getElements(".color", "array");
// const colorDivs = Array.from(document.querySelectorAll(".color"));
const currentHexes = Array.from(document.querySelectorAll(".color h2"));
const generateBtn = document.querySelector(".generate");
const libraryBtn = document.querySelector(".library");
const libraryContainer = document.querySelector(".library-container");
const lockButtons = Array.from(document.querySelectorAll(".lock"));
const popup = document.querySelector(".copy-container");
const submitSave = document.querySelector(".submit-save");
const saveBtn = document.querySelector(".save");
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-container input");
const sliders = Array.from(document.querySelectorAll('input[type = "range"]'));
const sliderContainers = Array.from(document.querySelectorAll(".sliders"));
let initialColors;
let savedPalettes = [];

//GLOBAL EVENT LISTENERS
adjustmentPanelBtns.map((button, index) => {
	button.addEventListener("click", () => {
		const activeDiv = colorDivs[index];
		if (activeDiv.classList.contains("locked")) {
			return;
		} else {
			openAdjustmentPanel(index);
		}
	});
});

deleteAllPalettesBtn.addEventListener("click", deleteAll);

closeAdjustment.map((close, index) => {
	close.addEventListener("click", () => {
		closeAdjustmentPanel(index);
	});
});

closeLibraryBtn.addEventListener("click", closeLibrary);

closeSave.addEventListener("click", closeSavePalette);

colorDivs.map((div, index) => {
	div.addEventListener("change", () => {
		updateUiText(index);
	});
});

currentHexes.map((hex) => {
	hex.addEventListener("click", () => {
		copyToClipBoard(hex);
	});
});

generateBtn.addEventListener("click", randomColors);

libraryContainer.children[0].addEventListener("keyup", function (e) {
	if (e.keyCode === 27) {
		closeLibrary();
	}
});

libraryBtn.addEventListener("click", openLibrary);

lockButtons.map((button, index) => {
	button.addEventListener("click", () => {
		lock(button, index);
	});
});

popup.addEventListener("transitionend", () => {
	const popupBox = popup.children[0];
	popup.classList.remove("active");
	popupBox.classList.remove("active");
});

saveBtn.addEventListener("click", openSavePalette);

saveInput.addEventListener("keyup", function (e) {
	if (e.keyCode === 13) {
		submitSave.click();
	} else if (e.keyCode === 27) {
		closeSave.click();
	}
});

sliders.map((slider) => slider.addEventListener("input", hslControls));

submitSave.addEventListener("click", savePalette);

window.addEventListener("keyup", function (e) {
	if (e.keyCode === 83) {
		if (
			saveContainer.classList.contains("active") ||
			libraryContainer.classList.contains("active")
		) {
			return;
		} else {
			saveBtn.click();
		}
	} else if (e.keyCode === 71) {
		if (
			saveContainer.classList.contains("active") ||
			libraryContainer.classList.contains("active")
		) {
			return;
		} else {
			generateBtn.click();
		}
	} else if (e.keyCode === 76) {
		if (
			saveContainer.classList.contains("active") ||
			libraryContainer.classList.contains("active")
		) {
			return;
		} else {
			libraryBtn.click();
		}
	}
});

//GLOBAL FUNCTIONS
function getElements(selector, isArray) {
	if (isArray) {
		return Array.from(document.querySelectorAll(selector));
	} else {
		return document.querySelector(selector);
	}
}

function generateHex() {
	const hexColor = chroma.random();
	return hexColor;
}

function randomColors() {
	initialColors = [];

	colorDivs.map((div, index) => {
		const hexText = div.children[0];
		const randomColor = generateHex();

		if (div.classList.contains("locked")) {
			initialColors.push(hexText.innerText);
			return;
		} else {
			initialColors.push(chroma(randomColor).hex());
		}

		div.style.backgroundColor = randomColor;
		hexText.innerText = randomColor;
		checkTextContrast(randomColor, hexText);
		const icons = colorDivs[index].querySelectorAll(".controls button");
		for (icon of icons) {checkTextContrast(initialColors[index], icon);} //prettier-ignore
		const sliders = div.querySelectorAll(".sliders input");
		const hue = sliders[0];
		const brightness = sliders[1];
		const saturation = sliders[2];
		colorizeSliders(randomColor, hue, brightness, saturation);
	});
	resetInputs();
}

function checkTextContrast(color, text) {
	const luminance = chroma(color).luminance();
	if (luminance > 0.5) {
		text.style.color = "black";
	} else {
		text.style.color = "white";
	}
}

function colorizeSliders(color, hue, brightness, saturation) {
	const midBright = color.set("hsl.l", 0.5);
	const scaleBright = chroma.scale(["black", midBright, "white"]);
	const noSat = color.set("hsl.s", 0);
	const fullSat = color.set("hsl.s", 1);
	const scaleSat = chroma.scale([noSat, color, fullSat]);

	hue.style.backgroundImage = `linear-gradient(to right, rgb(255, 0, 0), rgb(255,255 ,0),rgb(0, 255, 0),rgb(0, 255, 255),rgb(0,0,255),rgb(255,0,255),rgb(255,0,0))`; // prettier-ignore
	brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(0)}, ${scaleBright(0.5)}, ${scaleBright(1)})`; // prettier-ignore
	saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(0)}, ${scaleSat(1)})`; // prettier-ignore
}

function hslControls(e) {
	const index =
		e.target.getAttribute("data-hue") ||
		e.target.getAttribute("data-sat") ||
		e.target.getAttribute("data-bright");
	let sliders = e.target.parentElement.querySelectorAll('input[type = "range"]'); // prettier-ignore
	const hue = sliders[0];
	const saturation = sliders[2];
	const brightness = sliders[1];
	const bgColor = initialColors[index];
	let color = chroma(bgColor)
		.set("hsl.h", hue.value)
		.set("hsl.s", saturation.value)
		.set("hsl.l", brightness.value);

	colorDivs[index].style.backgroundColor = color;
	colorizeSliders(color, hue, brightness, saturation);
}

function updateUiText(index) {
	const activeDiv = colorDivs[index];
	const color = chroma(activeDiv.style.backgroundColor);
	const hexText = activeDiv.querySelector("h2");
	const icons = activeDiv.querySelectorAll(".controls button");

	hexText.innerText = color.hex();
	checkTextContrast(color, hexText);
	for (let icon of icons) {
		checkTextContrast(color, icon);
	}
}

function resetInputs() {
	sliders.map((slider) => {
		if (slider.name === "hue") {
			const hueColor = initialColors[slider.getAttribute("data-hue")];
			const hueValue = Math.round(chroma(hueColor).hsl()[0]);
			slider.value = hueValue;
		}

		if (slider.name === "saturation") {
			const satColor = initialColors[slider.getAttribute("data-sat")];
			const satValue = Math.round(chroma(satColor).hsl()[1] * 100) / 100;
			slider.value = satValue;
		}

		if (slider.name === "brightness") {
			const brightColor = initialColors[slider.getAttribute("data-bright")];
			const brightValue = Math.round(chroma(brightColor).hsl()[2] * 100) / 100;
			slider.value = brightValue;
		}
	});
}

function copyToClipBoard(hex) {
	const textArea = document.createElement("textarea");
	textArea.value = hex.innerText;
	document.body.appendChild(textArea);
	textArea.select();
	document.execCommand("copy");
	document.body.removeChild(textArea);
	const popupBox = popup.children[0];
	popup.classList.add("active");
	popupBox.classList.add("active");
}

function openAdjustmentPanel(index) {
	sliderContainers[index].classList.toggle("active");
}

function closeAdjustmentPanel(index) {
	sliderContainers[index].classList.remove("active");
}

function lock(button, index) {
	colorDivs[index].classList.toggle("locked");
	lockButtons[index].firstChild.classList.toggle(`fa-lock-open`);
	lockButtons[index].firstChild.classList.toggle(`fa-lock`);
}

//LOCAL STORAGE/ SAVE & LOAD FUNCTIONS
function deleteAll() {
	closeLibrary();
	localStorage.clear();
	const paletteCatalogue = Array.from(
		document.getElementsByClassName("custom-palette")
	);
	paletteCatalogue.map((palette) => {
		palette.remove();
	});
	savedPalettes = [];
}

function unlockAll() {
	colorDivs.map((div, index) => {
		if (div.classList.contains("locked")) {
			div.classList.remove("locked");
			lockButtons[index].firstChild.classList.toggle(`fa-lock-open`);
		} else {
			return;
		}
	});
}

function openSavePalette(e) {
	const popup = saveContainer.children[0];
	saveContainer.classList.add("active");
	popup.classList.add("active");
	saveInput.focus();
	saveInput.select();
}

function closeSavePalette(e) {
	const popup = saveContainer.children[0];
	saveContainer.classList.remove("active");
	popup.classList.remove("active");
}

function openLibrary(e) {
	const popup = libraryContainer.children[0];
	libraryContainer.classList.add("active");
	popup.classList.add("active");
	popup.focus(); //popup.focus() seems intermittent
}

function closeLibrary(e) {
	const popup = libraryContainer.children[0];
	libraryContainer.classList.remove("active");
	popup.classList.remove("active");
	// window.focus();
}

function generatePalette(paletteObj) {
	const palette = document.createElement("div");
	palette.classList.add("custom-palette");

	const paletteTitle = document.createElement("h4");
	paletteTitle.innerText = paletteObj.name;

	const palettePreview = document.createElement("div");
	palettePreview.classList.add("small-preview");

	paletteObj.colors.map((color, index) => {
		const palettePreviewColors = document.createElement("div");
		palettePreviewColors.classList.add(`preview-color-${index}`);
		palettePreviewColors.style.backgroundColor = color;
		palettePreview.appendChild(palettePreviewColors);
	});

	const palettePreviewBtn = document.createElement("button");
	palettePreviewBtn.classList.add("pick-palette-btn");
	palettePreviewBtn.classList.add(paletteObj.nr);
	palettePreviewBtn.innerText = "Select";

	palettePreviewBtn.addEventListener("click", (e) => {
		closeLibrary();
		const paletteIndex = e.target.classList[1];
		initialColors = [];
		savedPalettes[paletteIndex].colors.map((color, index) => {
			initialColors.push(color);
			colorDivs[index].style.backgroundColor = color;
			const text = colorDivs[index].children[0];
			checkTextContrast(color, text);
			updateUiText(index);
		});
		resetInputs();
		unlockAll();
	});

	const paletteDeleteBtn = document.createElement("button");
	paletteDeleteBtn.classList.add("delete");
	paletteDeleteBtn.classList.add(paletteObj.nr);
	paletteDeleteBtn.innerText = "Delete";

	paletteDeleteBtn.addEventListener("click", (e) => {
		const paletteDeleteBtns = Array.from(document.querySelectorAll(".delete"));
		const paletteIndex = e.target.classList[1];
		const paletteSelectionBtns = Array.from(document.querySelectorAll(".pick-palette-btn")); //prettier-ignore

		localPalettes = JSON.parse(localStorage.getItem("palettes"));
		localPalettes.splice(paletteIndex, 1);
		localPalettes.map((paletteObj, index) => {
			paletteObj.nr = index;
			return paletteObj;
		});

		localStorage.setItem("palettes", JSON.stringify(localPalettes));
		savedPalettes = [];
		savedPalettes = [...localPalettes];

		paletteSelectionBtns.splice(paletteIndex, 1);
		paletteSelectionBtns.map((btn, index) => {
			btn.classList.replace(btn.classList[1], index);
		});

		paletteDeleteBtns.splice(paletteIndex, 1);
		paletteDeleteBtns.map((btn, index) => {
			btn.classList.replace(btn.classList[1], index);
		});

		e.target.parentElement.remove();

		if (savedPalettes.length === 0) {
			closeLibrary();
		} else {
			libraryContainer.children[0].focus();
		}
	});

	palette.appendChild(paletteTitle);
	palette.appendChild(palettePreview);
	palette.appendChild(palettePreviewBtn);
	palette.appendChild(paletteDeleteBtn);

	libraryContainer.children[0].appendChild(palette);
}

function savePalette(e) {
	const name = saveInput.value;
	const colors = [];
	currentHexes.map((hex) => {
		colors.push(hex.innerText);
	});
	let paletteNr;
	const paletteObjects = JSON.parse(localStorage.getItem("palettes")); //palettesObjects = null;
	if (paletteObjects) {
		paletteNr = paletteObjects.length;
	} else {
		paletteNr = savedPalettes.length;
	}
	const paletteObj = { name, colors, nr: paletteNr };

	savedPalettes.push(paletteObj);
	saveToLocal(paletteObj);
	saveInput.value = "";
	generatePalette(paletteObj);
	unlockAll();

	saveContainer.classList.remove("active");
	popup.classList.remove("active");
}

function saveToLocal(paletteObj) {
	let localPalettes;
	if (localStorage.getItem("palettes") === null) {
		localPalettes = [];
	} else {
		localPalettes = JSON.parse(localStorage.getItem("palettes"));
	}
	localPalettes.push(paletteObj);
	localStorage.setItem("palettes", JSON.stringify(localPalettes));
}

function getLocal() {
	if (localStorage.getItem("palettes") === null) {
		savedPalettes = [];
	} else {
		savedPalettes = JSON.parse(localStorage.getItem("palettes"));

		savedPalettes.map((paletteObj) => {
			generatePalette(paletteObj);
		});
	}
}

getLocal();
randomColors();
