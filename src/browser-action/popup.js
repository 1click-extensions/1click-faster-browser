/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const stats = require('../stats');
const state = require('../state')();
const { $id } = require('../helpers');
const getUri = require('../helpers').getUriFromTab;

chrome.tabs.getSelected(null, function(tab){
	stats.get(tab.id, function(stat) {
		if (stat == null) { stat = {count: 0, libs: []}; }

		$id('resources-count')
			.innerHTML = stat.count;
		return $id('total-resources-count')
			.innerHTML = stats.allStats.count;
	});

	state.get(tab.id, function(pageConfig) {
		if (pageConfig.disabled) {
			disable();
		} else {
			enable();
		}

		return $id('switch').addEventListener('change', function(e) {
			if (this.checked) {
				pageConfig.disabled = false;
				enable();
			} else {
				pageConfig.disabled = true;
				disable();
			}
			return state.sync(pageConfig);
		});
	});

	return $id('site-id').innerHTML = getUri(tab);
});

var disable = function(){
	$id('enabled').style.display = 'none';
	$id('disabled').style.display = 'inline';
	return $id('switch').checked = false;
};

var enable = function() {
	$id('disabled').style.display = 'none';
	$id('enabled').style.display = 'inline';
	return $id('switch').checked = true;
};
