const s_template = document.getElementById("stylesheetTemplate");
const p_template = document.getElementById("propertyTemplate");
const g_template = document.getElementById("groupTemplate");
// Create stylesheet html node from object representation
/**
 * sheet = {
 * 		name: _discord.css (if discord's stylesheet) or name of imported stylesheet (e.g. base.css),
 * 		disabled: boolean,
 * 		groups : [...] (array of custom property groups) 
 * }
 * 
 * style = {
 * 		.selectorWithChanges = {
 * 			--property-changed: value
 * 		}
 * 		[, ...]
 * }
 * style can also be empty
 */
function createStylesheetNode(sheet, style) {
	// Use template for html structure
	let clon = s_template.content.cloneNode(true);
	clon.querySelector(".stylesheetName").innerText = sheet.name;

	// Set properties for checkbox (for enabling/disabling stylesheets)
	let cb = clon.querySelector(".stylesheetEnabled");
	cb.dataset.name = sheet.name;
	if (sheet.name == "_discord.css") { // Prevent discord's stylesheet from being disabled
		cb.parentElement.removeChild(cb);
	} else { // Use saved setting, default = disabled
		cb.checked = !sheet.disabled;
	}

	// Add properties to group (one group = one css selector)
	let grup = clon.querySelector(".groups");
	if (sheet.groups?.length) { // Stylesheet contains at least one property
		// If stylesheet contains only one group, open it by default
		let single = false;
		if (sheet.groups.length == 1) {
			single = true;
		}
		for (i in sheet.groups) {
			grup.appendChild(createGroupNode(sheet.groups[i], style, single));
		}
	} else { // Stylesheet contains no custom properties
		let notice = document.createElement("span");
		notice.innerText = "No properties in sheet";
		notice.classList.add("nopropertyNotice");
		grup.appendChild(notice);
	}
	return clon;
}
// Create group html node from object representation
/**
 * group = {
 * 		name: name of selector that contains the properties,
 * 		properties : [...] (array of custom properties) 
 * }
 * 
 * style = {
 * 		.selectorWithChanges = {
 * 			--property-changed: value
 * 		}
 * 		[, ...]
 * }
 * style can also be empty
 * 
 * isOpen .. initial state of details html tag
 */
function createGroupNode(group, style, isOpen) {
	// Use template for html structure
	let clon = g_template.content.cloneNode(true);
	clon.querySelector(".group").open = isOpen;
	clon.querySelector(".groupName").innerText = group.name;

	let prop = clon.querySelector(".properties");
	for (i in group.properties) {
		prop.appendChild(createPropertyNode(group.properties[i], style[group.name]));
	}
	return clon;
}
function createPropertyNode(property, groupStyle) {
	// Use template for html structure
	let clon = p_template.content.cloneNode(true);
	clon.querySelector(".propertyName").innerText = property.name;
	// Apply saved property value if present
	if (groupStyle && groupStyle[property.name]) {
		clon.querySelector(".propertyInput").value = groupStyle[property.name];
	}
	return clon;
}
