// Listen for requests from popup
let wrapper;
browser.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {
		// Make sure wrapper is present
		if (!wrapper) {
			sendResponse(false);
		} else {
			sendResponse(parseDocumentCSS());
		}
		return true;
	}
);
// React to storage change events
browser.storage.onChanged.addListener(function (changes) {
	for (let key in changes) {
		if (key == "style") { // custom property was changed
			document.getElementById("discordcss-custom-style").innerHTML = changesString(changes[key].newValue);
		} else { // stylesheet was enabled/disabled
			let sheet = wrapper.querySelector(`[data-name="${key}"]`);
			if (sheet) {
				sheet.disabled = !changes[key].newValue;
			}
		}
	}
});

fetchStylesheets(async function (sheets) {
	wrapper = document.getElementById("discordcss-wrapper");
	if (wrapper) {
		wrapper.innerHTML = "";
	} else {
		wrapper = document.createElement("div");
		wrapper.id = "discordcss-wrapper";
	}
	// Create wrapper div for all stylesheets
	// Create array with storage keys
	let entries = sheets.map((x) => x.split("/").pop());
	entries.push("style");
	// Fetch storage entries
	let settings = await browser.storage.sync.get(entries);
	let customstyle = settings.style || {};
	// Inject all stylesheets
	for (let i in sheets) {
		get(sheets[i], function (response) {
			let sheet = document.createElement("style");
			let name = sheets[i].split("/").pop();
			sheet.dataset.name = name;
			sheet.innerHTML = response;
			wrapper.appendChild(sheet);
			sheet.disabled = !(settings && settings[name]);
		});
	}
	// Inject custom property values
	let style = document.createElement("style");
	style.id = "discordcss-custom-style";
	style.innerHTML = changesString(customstyle) || "";
	wrapper.appendChild(style);
	document.head.appendChild(wrapper);
});
console.log("%c%s %c%s", "color: #00D4C0;", "[DiscordCSS]", "color: initial;", "Injected");

// Wrapper for making web requests 
function get(url, callback) {
	browser.runtime.sendMessage(url, callback);
}
