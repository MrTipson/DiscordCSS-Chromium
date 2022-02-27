// commonly used elements
const stylesheets = document.getElementById("stylesheets");
document.getElementById("refresh").addEventListener("click", getSheets);

document.getElementById("popout").addEventListener("click", () => {
	browser.windows.create({
		url: browser.extension.getURL('src/popup/popup.html'),
		type: "popup",
		width: 500,
		height: 350
	});
	window.close();
});

let changes = null;
browser.storage.sync.get("style")
	.then((saved) => changes = saved.style || {});

// Listen for all changes and determine input type in event handler
stylesheets.addEventListener("change", async function (event) {
	let path = event.composedPath();
	if (event.target.type == "checkbox") { // User enables/disables a stylesheet
		// Content script listens for changes in storage
		let obj = {}
		obj[event.target.dataset.name] = event.target.checked;
		browser.storage.sync.set(obj);
	} else if (event.target.type == "text") { // User changed custom property value
		// Retrieve values from event
		let group = path[3].querySelector(".groupName").innerText;
		let propertyName = path[1].querySelector(".propertyName").innerText;
		let value = event.target.value;

		// Make sure group is present unless property is getting deleted
		if (!changes[group] && value != "") {
			changes[group] = {};
		}
		if (value == "") { // Delete property from changes object
			delete changes[group][propertyName];
			// If group is now empty, delete it as well
			if (!changes[group].length) {
				delete changes[group];
			}
		} else { // Value is getting set and not deleted
			changes[group][propertyName] = value;
		}
		// Save changes
		browser.storage.sync.set({ style: changes });
	}
});

getSheets();

// Sends message to content page to recieve loaded stylesheets
async function getSheets() {
	browser.runtime.sendMessage(null, "plsGib")
		.then((response) => {
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
