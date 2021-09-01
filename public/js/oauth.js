const Dashboard = (function() {

	this.MEM = {}

	this.DOM = {
		oauth : {
			chatwork : document.getElementById('Dashboard.OAuth.Chatwork')
		},
		chatwork : {
			pre : document.getElementById('Dashboard.chatwork.pre'),
			getInfo : document.getElementById('Dashboard.chatwork.getInfo'),
			getRooms : document.getElementById('Dashboard.chatwork.getRooms'),
			getFiles : document.getElementById('Dashboard.chatwork.getFiles'),
			downloadFile : document.getElementById('Dashboard.chatwork.downloadFile'),
			uploadFile : document.getElementById('Dashboard.chatwork.uploadFile')
		}
	}

	this.EVT = {
		handleGetInfoClick : evt_handleGetInfoClick.bind( this ),
		handleGetRoomsClick : evt_handleGetRoomsClick.bind( this ),
		handleGetFilesClick : evt_handleGetFilesClick.bind( this ),
		handleDownloadClick : evt_handleDownloadClick.bind( this ),
		handleUploadClick : evt_handleUploadClick.bind( this )
	}

	this.API = {
		getSessionData : api_getSessionData.bind(this),
		setChatworkLink : api_setChatworkLink.bind(this)
	}

	init.apply( this );
	return this;

	function init() {

		feather.replace({ 'aria-hidden': 'true' })
		this.API.getSessionData();

		this.DOM.chatwork.getInfo.addEventListener('click', this.EVT.handleGetInfoClick);

	}

	async function api_getSessionData() {

		const req = await fetch( '/session' );
		const res = await req.json();

		console.log( res );
		this.MEM.session = res;
		this.API.setChatworkLink();

	}

	function api_setChatworkLink() {

		const state = Date.now();

		const url = [
			'https://www.chatwork.com/packages/oauth2/login.php',
			'?response_type=code',
			'&redirect_uri=https://cw.wsdlab.com/oauth/chatwork',
			'&client_id=0D43MyaOxMyO6',
			'&scope=users.all:read rooms.info:read rooms.files:read rooms.files:write',
			`&state=${state}`
		].join('');

		this.DOM.oauth.chatwork.setAttribute('href', url);

	}

	async function evt_handleGetInfoClick() {
 
		console.log( "click!!" );

		const url = "/chatwork/info";
		const params = {
			method : 'POST',
			headers : {
				'Content-Type' : 'applicaiton/json'
			}
		}

		const ajax = await fetch( url, params );
		const data = await ajax.json();
		this.DOM.chatwork.pre.textContent = JSON.stringify( data.msg, null, 4);

	}

	async function evt_handleGetRoomsClick() {

	}

	async function evt_handleGetFilesClick() {

	}

	async function evt_handleDownloadClick() {

	}

	async function evt_handleUploadClick() {

	}

}).apply({});
