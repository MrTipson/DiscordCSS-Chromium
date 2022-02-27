// Pass on messages between content script and popup/popout
browser.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {
		if (sender.tab && sender.envType != "addon_child") {
			get(request, sendResponse);
		} else {
			// Find active discord tab
			browser.tabs.query({ active: true, url: "https://discord.com/*" })
				.then(([activeTab]) => browser.tabs.sendMessage(activeTab.id, request))
				.then(sendResponse);
		}
		return true;
	}
)

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
