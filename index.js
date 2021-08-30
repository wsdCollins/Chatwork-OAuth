const express = require('express')
const fetch = require('node-fetch')
const dotenv = require('dotenv')

dotenv.config();

const app = express()
const port = 4000
app.use(express.static('public'))

app.get('/oauth/chatwork', async function(req, res) {

	// Create the body

	const body = [ 
		'grant_type=authorization_code',
		`code=${req.query.code}`,
		'redirect_uri=https://cw.wsdlab.com/oauth/chatwork'
	].join('&');

	// Create Authentication Header

	const basic =  `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`;
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

	console.log( params );
	
	const ajax = await fetch( url, params );
	const json = await ajax.json();
	res.json( json );

});

app.listen(port, () => {
	console.log(`Example app listening at port: ${port}`)
});

