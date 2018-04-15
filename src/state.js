/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const getUri = require('./helpers').getUriFromTab;

const load = function(){
	let state;
	if (localStorage["state"]) {
		state = JSON.parse(localStorage["state"]);
	}

	if (state == null) { state = {}; }


	state.get = (tabId, cb) =>
		chrome.tabs.get(tabId, tab => {
			const id = getUri(tab);
			const pageConfig = state[id] || { id };
			return cb(pageConfig);
		})
	;

	state.forHost = host => state[host];

	state.sync = function(pageConfig) {
		state[pageConfig.id] = pageConfig;
		localStorage["state"] = JSON.stringify(this);
		return this;
	};

	return state;
};


module.exports = load;
