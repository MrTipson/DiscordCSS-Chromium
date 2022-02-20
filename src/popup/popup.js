// Initialize button with user's preferred color
const stylesheets = document.getElementById("stylesheets");
const s_template = document.getElementById("stylesheetTemplate");
const p_template = document.getElementById("propertyTemplate");
const g_template = document.getElementById("groupTemplate");
document.getElementById("refresh").addEventListener("click", getSheets);

document.getElementById("popout").addEventListener("click", ()=>{
	chrome.windows.create({
		url: 'src/popup/popup.html',
		type: "popup"
	});
	window.close();
});

stylesheets.addEventListener("change", async function(event){
	chrome.runtime.sendMessage({kind: "set", element: {kind: event.target.type, name: event.target.dataset.name}, value: event.target.checked});
});

getSheets();

async function getSheets(){
	chrome.runtime.sendMessage({kind: "get"}, (response)=>{
		if(!response){
			stylesheets.innerText = "Error";
		}else{
			stylesheets.innerHTML = "";
			console.log(response);
			for(let i in response){
				let sheet = response[i];
				stylesheets.appendChild(createStylesheetNode(sheet, i == 0));
			}
		}
	});
}

function createStylesheetNode(sheet, disabledisable){
	let clon = s_template.content.cloneNode(true);
	clon.querySelector(".stylesheetName").innerText = sheet.name;
	let cb = clon.querySelector(".stylesheetEnabled");
	cb.dataset.name = sheet.name;
	if(disabledisable){
		cb.parentElement.removeChild(cb);
	} else{
		cb.checked = !sheet.disabled;
	}
	let grup = clon.querySelector(".groups");
	for(i in sheet.groups){
		grup.appendChild(createGroupNode(sheet.groups[i]));
	}
	return clon;
}
function createGroupNode(group){
	let clon = g_template.content.cloneNode(true);
	clon.querySelector(".groupName").innerText = group.name;
	let prop = clon.querySelector(".properties");
	for(i in group.properties){
		prop.appendChild(createPropertyNode(group.properties[i]));
	}
	return clon;
}
function createPropertyNode(property){
	let clon = p_template.content.cloneNode(true);
	clon.querySelector(".propertyName").innerText = property.name;
	return clon;
}