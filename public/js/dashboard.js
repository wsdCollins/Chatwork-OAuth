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
			uploadFile : document.getElementById('Dashboard.chatwork.uploadFile'),
			fileInput : document.getElementById('Dashboard.chatwork.fileInput'),
			refreshToken : document.getElementById('Dashboard.chatwork.refreshToken'),
			revokeAccess : document.getElementById('Dashboard.chatwork.revokeAccess')
		}
	}

	this.EVT = {
		handleGetInfoClick : evt_handleGetInfoClick.bind( this ),
		handleGetRoomsClick : evt_handleGetRoomsClick.bind( this ),
		handleGetFilesClick : evt_handleGetFilesClick.bind( this ),
		handleDownloadClick : evt_handleDownloadClick.bind( this ),
		handleUploadClick : evt_handleUploadClick.bind( this ),
		handleRefreshClick : evt_handleRefreshClick.bind( this ),
		handleFileChange : evt_handleFileChange.bind( this )
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
		this.DOM.chatwork.getRooms.addEventListener('click', this.EVT.handleGetRoomsClick);
		this.DOM.chatwork.getFiles.addEventListener('click', this.EVT.handleGetFilesClick);
		this.DOM.chatwork.downloadFile.addEventListener('click', this.EVT.handleDownloadClick);
		this.DOM.chatwork.uploadFile.addEventListener('click', this.EVT.handleUploadClick);
		this.DOM.chatwork.refreshToken.addEventListener('click', this.EVT.handleRefreshClick);

		this.DOM.chatwork.fileInput.addEventListener('change', this.EVT.handleFileChange);

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

		if(this.MEM.session.chatwork_oauth) {
			this.DOM.oauth.chatwork.setAttribute('class', 'w-100 btn btn-lg btn-primary disabled');
			this.DOM.oauth.chatwork.setAttribute('disabled', 'disabled');
			this.DOM.oauth.chatwork.textContent = "Connected";
		}

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

		const url = "/chatwork/rooms";
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

	async function evt_handleGetFilesClick() {

		const url = "/chatwork/listFiles";
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

	async function evt_handleDownloadClick() {

		const url = "/chatwork/downloadJSON";
		const params = {
			method : 'POST',
			headers : {
				'Content-Type' : 'applicaiton/json'
			}
		}

		const ajax = await fetch( url, params );
		const data = await ajax.json();

		if( !data.err ) {
			this.DOM.chatwork.pre.textContent = JSON.stringify( data.msg, null, 4);
		} else {
			this.DOM.chatwork.pre.textContent = `INVALID JSON:\n${data.msg}`;
		}

	}

	async function evt_handleRefreshClick() {

		const url = "/chatwork/refresh";
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

	function evt_handleUploadClick() {

		this.DOM.chatwork.fileInput.click();

	}

	function evt_handleFileChange( evt ) {
	
		if( !evt.target.files || !evt.target.files.length ) {
			return 0;
		}
		
		const file = evt.target.files[0];
		console.log( file );
		const reader = new FileReader();

		reader.onload = async () => {
			
			const text = reader.result;
			const body = {
				name : file.name,
				content : text
			}

			const url = "/chatwork/uploadJSON";
			const params = {
				method : 'POST',
				headers : {
					'Content-Type' : 'applicaiton/json'
				},
				body : JSON.stringify ( body )
			}

			const ajax = await fetch( url, params );
			const data = await ajax.json();

		}

		reader.readAsText( file );

	}

}).apply({});
