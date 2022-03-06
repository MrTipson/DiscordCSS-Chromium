// commonly used elements
const stylesheets = document.getElementById("stylesheets");
const picker = document.querySelector(".pickerWrapper");
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

stylesheets.addEventListener("click", function (event) {
	if (event.target.className == "colorInput") {
		let group = event.path[3].querySelector(".groupName").innerText;
		let propertyName = event.path[1].querySelector(".propertyName").innerText;
		colorPicker.activeEl = { group: group, propertyName: propertyName, propertyElement: event.path[1] };
		picker.classList.remove("pickerHidden");
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
		if (colorPicker.activeEl) {
			delete colorPicker.activeEl;
		}
		picker.classList.add("pickerHidden");
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
		let group = event.path[3].querySelector(".groupName").innerText;
		let propertyName = event.path[1].querySelector(".propertyName").innerText;
		let value = event.target.value;
		if (event.target.type == "color") {
			event.path[1].querySelector(".propertyInput").value = value;
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
