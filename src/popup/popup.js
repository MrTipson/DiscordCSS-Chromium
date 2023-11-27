// commonly used elements
const stylesheets = document.getElementById("stylesheets");
const picker = document.getElementById("pickerDrawer");
const iro = window.iro;

let changes = null;
chrome.storage.sync.get("style", function (response) {
	changes = response.style || {};
});

var colorPicker = new iro.ColorPicker("#colorPicker", {
	width: 150,
	color: "rgb(255, 0, 0)",
	borderWidth: 1,
	borderColor: "#fff",
	layoutDirection: "horizontal",
	layout: [
		{
			component: iro.ui.Box,
		},
		{
			component: iro.ui.Slider,
			options: {
				id: 'hue-slider',
				sliderType: 'hue'
			}
		},
		{
			component: iro.ui.Slider,
			options: {
				id: 'alpha-slider',
				sliderType: 'alpha'
			}
		}
	]
});
colorPicker.on("color:change", function (color) {
	chrome.runtime.sendMessage({ group: colorPicker.activeEl.group, property: colorPicker.activeEl.propertyName, value: color.hex8String });
});

stylesheets.addEventListener("click", function (event) {
	if (event.target.className == "colorInput") {
		let group = event.composedPath()[3].querySelector(".groupName").innerText;
		let propertyName = event.composedPath()[1].querySelector(".propertyName").innerText;
		colorPicker.activeEl = { group: group, propertyName: propertyName, propertyElement: event.composedPath()[1] };
		let color = event.composedPath()[1].querySelector(".propertyInput");
		colorPicker.color.set(color.value ? color.value : color.placeholder);
		picker.getElementsByClassName("pickerCurrentProperty")[0].innerText = propertyName;
		picker.classList.toggle("drawerHidden", false);
	}
});
picker.addEventListener("click", function (event) {
	let el = event.target;
	if (el.type == "button") {
		if (el.value == "Save" && colorPicker.activeEl) {
			let color = colorPicker.color.alpha == 1 && colorPicker.color.hexString || colorPicker.color.hex8String;
			colorPicker.activeEl.propertyElement.querySelector(".propertyInput").value = color;
			colorPicker.activeEl.propertyElement.querySelector(".colorInput").style.backgroundColor = color;
			changeProperty(colorPicker.activeEl.group, colorPicker.activeEl.propertyName, color);
		}
		// Reset live color update element
		chrome.runtime.sendMessage(null);
		if (colorPicker.activeEl) {
			delete colorPicker.activeEl;
		}
		picker.classList.toggle("drawerHidden", true);
	}
});

// Listen for all changes and determine input type in event handler
stylesheets.addEventListener("change", async function (event) {
	if (event.target.type == "checkbox") { // User enables/disables a stylesheet
		// Content script listens for changes in storage
		let obj = {}
		obj[event.target.dataset.name] = event.target.checked;
		chrome.storage.sync.set(obj);
	} else if (event.target.type == "text" || event.target.type == "color") { // User changed custom property value
		// Retrieve values from event
		let group = event.composedPath()[3].querySelector(".groupName").innerText;
		let propertyName = event.composedPath()[1].querySelector(".propertyName").innerText;
		let value = event.target.value;
		if (event.target.type == "color") {
			event.composedPath()[1].querySelector(".propertyInput").value = value;
		}
		changeProperty(group, propertyName, value);
	}
});

getSheets();

function changeProperty(group, propertyName, value) {
	// Make sure group is present unless property is getting deleted
	if (!changes[group] && value != "") {
		changes[group] = {};
	}
	if (value == "") { // Delete property from changes object
		delete changes[group][propertyName];
		// If group is now empty, delete it as well
		if (!Object.keys(changes[group]).length) {
			delete changes[group];
		}
	} else { // Value is getting set and not deleted
		changes[group][propertyName] = value;
	}
	// Save changes
	chrome.storage.sync.set({ style: changes });
}

// Sends message to content page to recieve loaded stylesheets
async function getSheets() {
	chrome.runtime.sendMessage("plsGib", (response) => {
		if (!response) {
			stylesheets.innerText = "Error";
		} else {
			// Remove all elements
			stylesheets.innerHTML = "";

			response.sort((x, y) => x.name.localeCompare(y.name));

			for (let i in response) {
				stylesheets.appendChild(createStylesheetNode(response[i], changes));
			}
		}
	});
}

const exportDrawer = document.getElementById("exportDrawer");
const exportField = document.getElementById("exportField");
document.getElementById("export").addEventListener("click", exportStylesheet);
async function exportStylesheet(event) {
	let settings = await chrome.storage.sync.get();
	let exportString = "";
	let styleString = "";
	console.log(settings)
	for (let key in settings) {
		if (key === "style") {
			let style = settings["style"]
			for (let group in style) {
				styleString += `${group} {\n`;
				for (let propertyName in style[group]) {
					styleString += `\t${propertyName}: ${style[group][propertyName]};\n`;
				}
				styleString += `}\n`;
			}
		} else if (settings[key]) {
			exportString += `@import url("https://mrtipson.github.io/DiscordCSS/css/${key}");\n`;
		}
	}
	if (exportString.length > 0) {
		exportString += `\n`;
	}
	exportString += styleString;

	exportField.value = exportString;
	exportDrawer.classList.toggle("drawerHidden", false);
}
exportDrawer.addEventListener("click", (event) => {
	if (event.target.value === "Close") {
		exportDrawer.classList.toggle("drawerHidden", true);
	}
});

// Skip the initial animations
setTimeout(() => {
	for (let drawer of document.getElementsByClassName("drawer")) {
		drawer.classList.remove("noanimation");
	}
}, 1000);
