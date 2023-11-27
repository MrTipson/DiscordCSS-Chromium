// Parse document stylesheet objects into names and values of custom css properties and their respective selectors and stylesheets
// Discord's stylesheets are removed due to clutter. They are readded by the popup using hardcoded properties.
/** Adapted from https://css-tricks.com/how-to-get-all-custom-properties-on-a-page-in-javascript/
 * Returns: [
 * 		{
 * 			name: filename of external stylesheet,
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
const discordProperties = ["header-primary", "header-secondary", "text-normal", "text-link", "text-muted",
	"channels-default", "interactive-normal", "interactive-hover", "interactive-muted", "interactive-active",
	"background-primary", "background-secondary", "background-secondary-alt", "background-tertiary", "background-floating",
	"input-background", "background-modifier-active", "background-modifier-hover", "background-modifier-selected",
	"background-modifier-accent", "channeltextarea-background", "background-message-hover",
	"search-popout-option-user-username", "search-popout-option-user-nickname", "search-popout-option-non-text-color",
	"scrollbar-thin-thumb", "scrollbar-thin-track", "scrollbar-auto-thumb", "scrollbar-auto-track",
	"messages-scroll-thumb", "messages-scroll-track", "radio-bar-accent-color"
]
function parseDocumentCSS() {
	let stylesheets = [...document.styleSheets]
		.map((stylesheet) => {
			return {
				name: stylesheet.ownerNode.dataset.name,
				disabled: stylesheet.disabled,
				groups: [...stylesheet.cssRules]
					.filter((rule) => rule.type === 1)
					.map((rule) => {
						return {
							name: rule.selectorText,
							properties: [...rule.style]
								.filter((property) => property.indexOf("--") === 0)
								.map((property) => {
									return {
										name: property,
										value: rule.style.getPropertyValue(property)
									}
								})
						}
					})
					.filter((group) => group.properties.length)
			}
		})
		.filter((stylesheet) => stylesheet.name);
	let dummy = document.createElement("div");
	dummy.style.display = 'none';
	document.body.appendChild(dummy);
	const styles = window.getComputedStyle(document.body);
	stylesheets.push({
		name: "_discord.css",
		disabled: false,
		groups: [{
			name: ":root",
			properties: discordProperties.map(prop => {
				prop = "--" + prop;
				value = styles.getPropertyValue(prop);
				if (value.includes('calc')) {
					dummy.style.color = value;
					value = window.getComputedStyle(dummy).color;
				}
				return {
					name: prop,
					value: value
				}
			})
		}]
	});
	document.body.removeChild(dummy);
	return stylesheets;
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