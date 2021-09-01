"use strict";

const LoginManager = (function() {

	this.MEM = {}

	this.DOM = {
		email : document.getElementById('LoginManager.email'),
		password : document.getElementById('LoginManager.password'),
		submit : document.getElementById('LoginManager.submit')
	}

	this.EVT = {
		handleSubmitClick : evt_handleSubmitClick.bind(this)
	}

	this.API = {
		submitLoginForm : api_submitLoginForm.bind(this)
	}

	init.apply(this);
	
	function init() {

		this.DOM.submit.addEventListener( 'click', this.EVT.handleSubmitClick );

	}

	function evt_handleSubmitClick( evt ) {

		evt.preventDefault();
		this.API.submitLoginForm();

	}

	async function api_submitLoginForm() {

		const body = {
			email : this.DOM.email.value,
			password : this.DOM.password.value
		}

		const url = '/login';
		const params = {
			method : 'POST',
			headers : {
				'Accept' : 'application/json',
				'Content-Type': 'application/json'
			},
			body : JSON.stringify( body )
		};

		const req = await fetch( url, params );
		const res = await req.json();

		if( res.err ) {
			return alert( res.msg );
		}

		window.location.href = res.msg;

	}

}).apply({});
