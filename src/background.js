chrome.runtime.onInstalled.addListener(init);
chrome.runtime.onStartup.addListener(init);

function init() {
	chrome.action.disable();
	// Replace all rules ...
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
		// With a new rule ...
		let rule = {
			conditions: [
			new chrome.declarativeContent.PageStateMatcher({
				pageUrl: { hostEquals: 'discord.com'}
			})
			],
			// And shows the extension's page action.
			actions: [ new chrome.declarativeContent.ShowPageAction() ]
		}
		chrome.declarativeContent.onPageChanged.addRules([rule]);
	});
}