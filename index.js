/**
 * Imports
 **/

const express = require('express')
const fetch = require('node-fetch')
const dotenv = require('dotenv')
const session = require('express-session')
const uuidv1 = require('uuid').v1;
const FileStore = require('session-file-store')(session);
const FormData = require('form-data');

// Self Defined import
const db = require("./lib/database.js");

/**
 * Create Application
 **/

dotenv.config();
const app = express()
app.use( express.json() )
const port = 4000

app.use(express.static('public'))
app.use(express.json());
app.set('trust proxy', 1)
app.use(session({
	store: new FileStore(),
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true,
	cookie: { secure: true }
}))

/**
 * Create Database
 **/

/**
 * OAuth Callbacks
 **/

app.get('/oauth/chatwork', async function(req, res) {

	if( req.query.error ) {
		return res.redirect('/dashboard.html');
	}

	// Create the Authentication body

	const body = [ 
		'grant_type=authorization_code',
		`code=${req.query.code}`,
		'redirect_uri=https://cw.wsdlab.com/oauth/chatwork'
	].join('&');

	// Create Authentication Header

	const basic =	`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`;
	const base64 = Buffer.from( basic ).toString( 'base64' );

	const url = 'https://oauth.chatwork.com/token';
	const params = {
		method : 'POST',
		headers : {
			'Authorization' : `Basic ${base64}`,
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body : body
	}

	// Send Authentication Response

	const ajax = await fetch( url, params );
	const json = await ajax.json();

	const update_sql = `
		UPDATE
			dat_users
		SET
			chatwork_oauth = ?
		WHERE
			user_uuid = ?
	`;

	const update_args = [
		JSON.stringify( json ),
		req.session.data.user_uuid
	]

	await db.query( update_sql, update_args );

	const insert_sql = `
		INSERT INTO dat_log_token (
			user_email,
			access_token,
			token_type,
			expires_in,
			refresh_token,
			scope
		) VALUES ( 
			?,
			?,
			?,
			?,
			?,
			?
		)
	`;

	const insert_args = [
		req.session.data.user_email,
		json.access_token,
		json.token_type,
		json.expires_in,
		json.refresh_token,
		json.scope
	];

	await db.query( insert_sql, insert_args );
	req.session.data.chatwork_oauth = json;
	res.redirect('/dashboard.html');

});

app.get('/session', async function(req, res) {

	res.json( req.session.data );

});

app.get('/logout', async function(req, res) {

	req.session.destroy(function() {
		res.redirect('/');
	});

});

/**
 * Chatwork Callbacks
 **/

app.post('/chatwork/revoke', async function(req, res) {

	if(!req.session.data.chatwork_oauth) {
		return res.json({
			err : 1,
			msg : "No chatwork token"
		});
	}

	const update_sql = `
		UPDATE
			dat_users
		SET
			chatwork_oauth = NULL
		WHERE
			user_uuid = ?
	`;

	const update_args = [
		req.session.data.user_uuid
	]

	await db.query( update_sql, update_args );
	req.session.data.chatwork_oauth = null;

	res.json({
		err : 0,
		msg : req.session.data
	});

});

app.post('/chatwork/refresh', async function(req, res) {

	if(!req.session.data.chatwork_oauth) {
		return res.json({
			err : 1,
			msg : "No chatwork token"
		});
	}

	// Create the Authentication body

	const body = [ 
		'grant_type=refresh_token',
		`refresh_token=${req.session.data.chatwork_oauth.refresh_token}`,
	].join('&');

	// Create Authentication Header

	const basic = `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`;
	const base64 = Buffer.from( basic ).toString( 'base64' );

	const url = 'https://oauth.chatwork.com/token';
	const params = {
		method : 'POST',
		headers : {
			'Authorization' : `Basic ${base64}`,
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body : body
	}

	// Send Authentication Response

	const ajax = await fetch( url, params );
	const json = await ajax.json();
	req.session.data.chatwork_oauth = json;

	const update_sql = `
		UPDATE
			dat_users
		SET
			chatwork_oauth = ?
		WHERE
			user_uuid = ?
	`;

	const update_args = [
		JSON.stringify( json ),
		req.session.data.user_uuid
	]

	await db.query( update_sql, update_args );

	const insert_sql = `
		INSERT INTO dat_log_token (
			user_email,
			access_token,
			token_type,
			expires_in,
			refresh_token,
			scope
		) VALUES ( 
			?,
			?,
			?,
			?,
			?,
			?
		)
	`;

	const insert_args = [
		req.session.data.user_email,
		json.access_token,
		json.token_type,
		json.expires_in,
		json.refresh_token,
		json.scope
	];

	await db.query( insert_sql, insert_args );

	res.json({
		err : 0,
		msg : json
	});
	
});

app.post('/chatwork/info', async function(req, res) {

	if(!req.session.data.chatwork_oauth) {
		return res.json({
			err : 1,
			msg : "No chatwork token"
		});
	}
	
	const url = "https://api.chatwork.com/v2/me";
	const params = {
		method : "GET",
		headers : {
			'Authorization' : `Bearer ${req.session.data.chatwork_oauth.access_token}`
		}
	}

	const ajax = await fetch( url, params );
	const data = await ajax.json();
	
	res.json({
		err : 0,
		msg : data
	});

});

app.post('/chatwork/rooms', async function(req, res) {

	if(!req.session.data.chatwork_oauth) {
		return res.json({
			err : 1,
			msg : "No chatwork token"
		});
	}
	
	const url = "https://api.chatwork.com/v2/rooms";
	const params = {
		method : "GET",
		headers : {
			'Authorization' : `Bearer ${req.session.data.chatwork_oauth.access_token}`
		}
	}

	const ajax = await fetch( url, params );
	const data = await ajax.json();
	
	res.json({
		err : 0,
		msg : data
	});

});

app.post('/chatwork/listFiles', async function(req, res) {

	if(!req.session.data.chatwork_oauth) {
		return res.json({
			err : 1,
			msg : "No chatwork token"
		});
	}
	
	// First we get account information

	let url = "https://api.chatwork.com/v2/me";
	const params = {
		method : "GET",
		headers : {
			'Authorization' : `Bearer ${req.session.data.chatwork_oauth.access_token}`
		}
	}

	let ajax = await fetch( url, params );
	let data = await ajax.json();
	const room_id = data.room_id;
	const account_id = data.account_id;

	// Get the list of files for "My Chat" 

	url = `https://api.chatwork.com/v2/rooms/${room_id}/files?account_id=${account_id}`;
	ajax = await fetch( url, params );
	data = await ajax.json();

	// Return the response
	
	res.json({
		err : 0,
		msg : data
	});

});

app.post('/chatwork/downloadJSON', async function(req, res) {

	if(!req.session.data.chatwork_oauth) {
		return res.json({
			err : 1,
			msg : "No chatwork token"
		});
	}
	
	// First we get account information

	let url = "https://api.chatwork.com/v2/me";
	const params = {
		method : "GET",
		headers : {
			'Authorization' : `Bearer ${req.session.data.chatwork_oauth.access_token}`
		}
	}

	let ajax = await fetch( url, params );
	let data = await ajax.json();
	const room_id = data.room_id;
	const account_id = data.account_id;

	// Get the list of files for "My Chat" 

	url = `https://api.chatwork.com/v2/rooms/${room_id}/files?account_id=${account_id}`;
	ajax = await fetch( url, params );
	const files = await ajax.json();

	const queue = files.filter( elem => {
		return elem.filename.indexOf('.json') !== -1;
	});

	if(!queue.length) {
		return res.json({
			err : 0,
			msg : "No JSON Data Found is 'My Chat' Room"
		});
	}

	// Download the most recent JSON file

	const reqFile = queue.pop();
	const file_id = reqFile.file_id;
	url = `https://api.chatwork.com/v2/rooms/${room_id}/files/${file_id}?create_download_url=1`;
	ajax = await fetch( url, params );
	const file = await ajax.json();

	ajax = await fetch( file.download_url );
	data = await ajax.text();
	
	try {
		let o = JSON.parse( data );
		data = o;
	} catch(err) {
		// Ignore error
	}
	
	// Return the response
	
	res.json({
		err : typeof data === "object" ? 0 : 1,
		msg : data
	});

});

app.post('/chatwork/uploadJSON', async function(req, res) {

	if(!req.session.data.chatwork_oauth) {
		return res.json({
			err : 1,
			msg : "No chatwork token"
		});
	}
	
	// First we get account information

	let url = "https://api.chatwork.com/v2/me";
	const params = {
		method : "GET",
		headers : {
			'Authorization' : `Bearer ${req.session.data.chatwork_oauth.access_token}`
		}
	}

	let ajax = await fetch( url, params );
	let data = await ajax.json();
	const room_id = data.room_id;
	const account_id = data.account_id;

	// Then we create the request to upload the file
	
	const file = Buffer.from( req.body.content );

	const form = new FormData();
	form.append('file', file, {
		contentType : 'application/json',
		filename : req.body.name,
		knownLength : file.length
	});
	
	form.append('message', 'Message attached to file');
	url = `https://api.chatwork.com/v2/rooms/${room_id}/files`;
	params.method = "POST";
	params.headers['Content-Type'] = form.getHeaders()['content-type'];
	params.body = form;

	ajax = await fetch( url, params );
	data = await ajax.json();


	res.json({
		err : 0,
		msg : data
	});

});

/**
 * Internal Callbacks
 **/

app.post('/login', async function(req, res) {

	const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

	if( !emailRegexp.test(req.body.email) ) {

		res.json({
			err : 1,
			msg : 'INVALID EMAIL FORMAT'
		});

	} else if( req.body.password.length < 6 ) {

		res.json({
			err : 1,
			msg : 'INVALID PASSWORD FORMAT'
		});
	
	} else {
	
		const select_user = `
			SELECT
				*
			FROM
				dat_users
			WHERE
				user_email = ?
		`;

		const select_args = [ req.body.email ];

		const user_data = await db.selectOne( select_user, select_args );

		// If no user data exists, then we create a user
		if( !user_data ) {
			
			const user_uuid = uuidv1();
			const user_hash = await db.hash( req.body.password );

			const insert_sql = `
				INSERT INTO dat_users (
					user_uuid,
					user_email,
					user_hash
				) VALUES (
					?,
					?,
					?
				)
			`;

			const insert_args = [
				user_uuid,
				req.body.email,
				user_hash
			];

			await db.query( insert_sql, insert_args );

			const session_data = {
				user_uuid : user_uuid,
				user_email : req.body.email,
				chatwork_oauth : null
			}

			req.session.data = session_data;

			res.json({
				err : 0,
				msg : 'dashboard.html'
			});

		} else {

			const bool = await db.compare( req.body.password, user_data.user_hash );

			if( !bool ) {
				
				if( user_data.tries >= 3) {

					const remove_sql = `
						DELETE FROM
							dat_users
						WHERE
							user_email = ?
					`;

					const remove_args = [ req.body.email ];
					await db.query( remove_sql, remove_args );

					res.json({
						err : 1,
						msg : 'USER REMOVED'
					});

				} else {

					const update_sql = `
						UPDATE
							dat_users
						SET
							tries = tries + 1
						WHERE
							user_email = ?
					`;

					const update_args = [ req.body.email ];
					await db.query( update_sql, update_args );

					res.json({
						err : 1,
						msg : 'INVALID PASSWORD'
					});

				}

			} else {

				const update_sql = `
					UPDATE
						dat_users
					SET
						tries = 0
					WHERE
						user_email = ?
				`;

				const update_args = [ req.body.email ];
				await db.query( update_sql, update_args );

				const session_data = {
					user_uuid : user_data.user_uuid,
					user_email : req.body.email,
					chatwork_oauth : JSON.parse( user_data.chatwork_oauth )
				}

				req.session.data = session_data;

				res.json({
					err : 0,
					msg : 'dashboard.html'
				});
				
			}

		}



	}


});

/**
 * Start Application
 **/

app.listen(port, () => {
	console.log(`Example app listening at port: ${port}`)
});

