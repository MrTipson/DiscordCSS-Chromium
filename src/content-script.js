// Listen for requests from popup
let wrapper;
let live;
chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {
		// Make sure wrapper is present
		if (!wrapper) {
			sendResponse(false);
		} else if (request === "plsGib") {
			sendResponse(parseDocumentCSS());
		} else {
			live.innerText = request ? `${request.group}{${request.property}: ${request.value};}` : "";
		}
		return true;
	}
);
// React to storage change events
chrome.storage.sync.onChanged.addListener(function (changes) {
	for (let key in changes) {
		if (key == "style") { // custom property was changed
			document.getElementById("discordcss-custom-style").innerHTML = changesString(changes[key].newValue);
		} else {
			let sheet = wrapper.querySelector(`[data-name="${key}"]`);
			if (sheet) { // stylesheet was enabled/disabled
				sheet.disabled = !changes[key].newValue;
			}
		}
	}
});

fetchStylesheets(async function (sheets) {
	// Create wrapper div for all stylesheets
	wrapper = document.createElement("div");
	wrapper.id = "discordcss-wrapper";
	// Create array with storage keys
	let entries = sheets.map((x) => x.split("/").pop());
	entries.push("style");
	// Fetch storage entries
	let settings = await chrome.storage.sync.get(entries);
	let customstyle = settings.style || {};
	// Inject all stylesheets
	for (let i in sheets) {
		get(sheets[i], function (response) {
			let sheet = document.createElement("style");
			let name = sheets[i].split("/").pop();
			sheet.dataset.name = name;
			sheet.innerText = response;
			wrapper.appendChild(sheet);
			sheet.disabled = !(settings && settings[name]);
		});
	}
	// Inject custom property values
	let style = document.createElement("style");
	style.id = "discordcss-custom-style";
	style.innerText = changesString(customstyle) || "";
	live = document.createElement("style");
	live.id = "discordcss-live-changes";
	// Make 'sure' it loads last so it has priority
	setTimeout(() => {
		document.head.appendChild(style);
		document.head.appendChild(live);
	}, 1000);
	document.head.appendChild(wrapper);
});
console.log("%c%s %c%s", "color: #00D4C0;", "[DiscordCSS]", "color: initial;", "Injected");

// Wrapper for making web requests 
function get(url, callback) {
	let xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			callback(xhr.responseText);
		}
	};
	xhr.open("GET", url);
	xhr.send();
}
