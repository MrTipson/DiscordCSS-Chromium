// Listen for requests from popup
/**
 *  request = { kind, element, value }
 * 		kind = get:
 * 			element and value fields not present
 * 		kind = set:
 * 			element: { kind: "text" or "checkbox", name: string },
 * 			element = checkbox:
 * 				name = stylesheet name
 * 				value = true/false -> stylesheet isEnabled
 * 			element = text
 * 				name = null
 * 				value = {
 * 					group: group name			
 * 					propertyName: property name
 * 					value: property value
 * 				} 
 */
let wrapper;
chrome.runtime.onMessage.addListener(
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
chrome.storage.sync.onChanged.addListener(function (changes) {
	console.log(changes);
	for (let key in changes) {
		if (key == "style") {
			document.getElementById("discordcss-custom-style").innerHTML = changesString(changes[key].newValue);
		} else {
			let sheet = wrapper.querySelector(`[data-name="${key}"]`);
			if (sheet) {
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
console.log("\033[36m%s \033[39m%s", "[DiscordCSS]", "Injected");
// Parse document stylesheet objects into names and values of custom css properties and their respective selectors and stylesheets
/** Adapted from https://css-tricks.com/how-to-get-all-custom-properties-on-a-page-in-javascript/
 * Returns: [
 * 		{
 * 			name: _discord.css or filename of external stylesheet,
 * 			disabled: boolean,
 * 			groups: [
 * 				name: group name (css selector),
 * 				properties: [
 * 					{
 * 						name: css custom property name
 * 						value: css custom property value
 * 					}
 * 					[, ...]
 * 				]
 * 			]
 * 			[, ...]
 * 		}
 * 		[, ...]
 * 	]
 */
function parseDocumentCSS() {
	return [...document.styleSheets]
		.map((stylesheet) => {
			return {
				name: (stylesheet.href && "_discord.css") || stylesheet.ownerNode.dataset.name,
				disabled: stylesheet.disabled,
				groups: [...stylesheet.cssRules]
					.filter((rule) => rule.type === 1)
					.map((rule) => {
						return {
							name: rule.selectorText,
							properties: [...rule.styleMap.entries()]
								.filter((property) => property[0].indexOf("--") === 0)
								.map((property) => {
									return {
										name: property[0],
										value: property[1]
									}
								})
						}
					})
					.filter((group) => group.properties.length)
			}
		})
		.filter((stylesheet) => stylesheet.name);
}

// Convert changes object to a css formatted string (to be injected into a style tag)
function changesString(changes) {
	let tostring = "";
	for (let grp in changes) {
		tostring += `${grp} {`;
		for (let prop in changes[grp]) {
			tostring += `${prop}: ${changes[grp][prop]};`;
		}
		tostring += `}`;
	}
	return tostring;
}

// Finds all stylesheets in DiscordCSS/css and returns the links
function fetchStylesheets(callback) {
	const root = "https://api.github.com/repos/MrTipson/DiscordCSS/git/trees/5fe13e3060d72dcce2954c987475f6028a7cfb88";
	get(root, function (responseText) {
		let arr = [];
		let sheets = JSON.parse(responseText).tree;
		for (s in sheets) {
			arr.push("https://mrtipson.github.io/DiscordCSS/css/" + sheets[s].path);
		}
		callback(arr);
	});
}

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
