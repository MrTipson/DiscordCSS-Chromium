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
chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {
		let temp = document.getElementById("discordcss-wrapper");

		// Make sure wrapper is present
		if (!temp) {
			sendResponse(false);
			return true;
		}

		if (request.kind == "get") { // Return list of loaded stylesheets
			sendResponse(parseDocumentCSS());
		} else if (request.kind == "set") { // Commit changes made in extension popup
			if (request.element.kind == "checkbox") { // Enable/disable a stylesheet
				let sheet = temp.querySelector(`[data-name="${request.element.name}"]`);
				sheet.disabled = !request.value;
				// Save change
				let obj = {}
				obj[request.element.name] = request.value;
				chrome.storage.sync.set(obj);
			} else if (request.element.kind == "text") { // Change property value
				// Retrieve values from request object
				let group = request.value.group;
				let propertyName = request.value.propertyName;
				let value = request.value.value;

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
				chrome.storage.sync.set({ style: changes });
				document.getElementById("discordcss-custom-style").innerHTML = changesString();
			}
			sendResponse(true);
		}
		return true;
	}
);
let changes = null;
fetchStylesheets(async function (sheets) {
	// Create wrapper div for all stylesheets
	let temp = document.createElement("div");
	temp.id = "discordcss-wrapper";
	// Create array with storage keys
	let entries = sheets.map((x) => x.split("/").pop());
	entries.push("style");
	// Fetch storage entries
	let settings = await chrome.storage.sync.get(entries);
	changes = settings.style || {};
	// Inject all stylesheets
	for (let i in sheets) {
		get(sheets[i], function (response) {
			let sheet = document.createElement("style");
			let name = sheets[i].split("/").pop();
			sheet.dataset.name = name;
			sheet.innerHTML = response;
			temp.appendChild(sheet);
			sheet.disabled = !(settings && settings[name]);
		});
	}
	// Inject custom property values
	let style = document.createElement("style");
	style.id = "discordcss-custom-style";
	style.innerHTML = changesString() || "";
	temp.appendChild(style);
	document.head.appendChild(temp);
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
	return {
		sheets: [...document.styleSheets]
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
			.filter((stylesheet) => stylesheet.name),
		style: changes
	};
}

// Convert changes object to a css formatted string (to be injected into a style tag)
function changesString() {
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
