(function () {

	'use strict'

	const state = Date.now();
	const url = [
		'https://www.chatwork.com/packages/oauth2/login.php',
		'?response_type=code',
		'&redirect_uri=https://cw.wsdlab.com/oauth/chatwork',
		'&client_id=0D43MyaOxMyO6',
		'&scope=users.all:read rooms.info:read rooms.files:read rooms.files:write',
		`&state=${state}`
	].join('');

	const cw_oauth = document.getElementById('cw_oauth');
	cw_oauth.setAttribute('href', url);

	feather.replace({ 'aria-hidden': 'true' })

})();
