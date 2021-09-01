const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();

const TABLES = [
	`
		CREATE TABLE IF NOT EXISTS dat_users (
			user_uuid VARCHAR(36) NOT NULL,
			user_email VARCHAR(255) NOT NULL UNIQUE,
			user_hash VARCHAR(255) NOT NULL,
			chatwork_oauth TEXT, 
			created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			tries INT NOT NULL DEFAULT 0,
			PRIMARY KEY(user_uuid)
		)
	`,
	`
		CREATE TABLE IF NOT EXISTS dat_log_token (
			user_email VARCHAR(255) NOT NULL,
			access_token TEXT,
			token_type VARCHAR(50),
			expires_in INT,
			refresh_token TEXT,
			scope TEXT,
			created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`
]

const conn = new sqlite3.Database('db.sqlite', function(err) {
	TABLES.forEach( sql => {
		conn.run( sql );
	});
});

const db = {
	query : function(sql, args) {
		return new Promise( function(resolve, reject) {

			conn.run(sql, args, function(err) {
				if(err) {
					return reject(err);
				}

				resolve();
			});

		});
	},
	selectOne : function(sql, args) {
		return new Promise( function(resolve, reject) {

			conn.get(sql, args, function(err, row) {
				if(err) {
					return reject(err);
				}

				resolve(row);
			});

		});
	},
	selectAll : function(sql, args) {
		return new Promise( function(resolve, reject) {

			conn.all(sql, args, function(err, rows) {
				if(err) {
					return reject(err);
				}

				resolve(rows);
			});

		});
	},
	hash : function(myPlaintextPassword) {

		return new Promise( function(resolve, reject) {

			let saltRounds = 10;
			bcrypt.genSalt(saltRounds, function(err, salt) {
				bcrypt.hash(myPlaintextPassword, salt, function(err, hash) {
					if(err) {
						throw err;
					}
					resolve(hash);
				});
			});

		});

	},
	compare : function(myPlaintextPassword, hash) {

		return new Promise( function(resolve, reject) {

			bcrypt.compare(myPlaintextPassword, hash, function(err, result) {
				if(err) {
					return reject(err);
				}

				resolve(result);
			});

		});

	}
}

module.exports = db;
