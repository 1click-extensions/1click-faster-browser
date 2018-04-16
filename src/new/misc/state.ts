/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

 import {getUriFromTab} from './helpers';
//const getUri = require('./helpers').getUriFromTab;

export const load = function(){
	let state:any = null;
	if (localStorage["state"]) {
		state = JSON.parse(localStorage["state"]);
	}

	if (state == null) { state = {}; }


	state.get = (tabId :number, cb:any) =>
		chrome.tabs.get(tabId, tab => {
			const id = getUriFromTab(tab);
			const pageConfig = state[id] || { id };
			return cb(pageConfig);
		})
	;

	state.forHost = function(host:string){return state[host]};

	state.sync = function(pageConfig : any) {
		state[pageConfig.id] = pageConfig;
		localStorage["state"] = JSON.stringify(this);
		return this;
	};

	return state;
};


