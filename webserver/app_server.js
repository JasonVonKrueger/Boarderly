/* Server for Boarderly */
const config = require('./lib/settings.json');
const http = require('http');
const express = require('express');
const socket_io = require('socket.io');
const path = require('path');
const fs = require('fs');

let messages = [];
let albums = [];

// get a list of albums and store in an array for future use
const { statSync } = require('fs');
const { readdir } = require('fs').promises;

// load up the photo albums
console.log('Fetching photo album list...');
getAlbums().then(function(results) {
	albums = results;
	//console.log(albums);
});

// load up the messages
console.log('Fetching message list...');
getMessages().then(function(results) {
	messages = results;
	//console.log(messages);
});

const app = express();
app.use('/', express.static('../webclients/board'));
app.use('/remote', express.static('../webclients/remote'));
app.use('/message', express.static('../webclients/message'));
app.use('/resources', express.static('../resources'));

app.use(express.json());

const server = http.Server(app);
const io = socket_io(server);

io.on('connection', function(socket) {
	console.log('a user connected');

	socket.on('GET_MESSAGES', function() {
		io.emit('REFRESH_MESSAGES', messages);
		//socket.broadcast.emit('REFRESH_MESSAGES', messages)
	});

	socket.on('REFRESH_MESSAGES', function() {
		socket.broadcast.emit('REFRESH_MESSAGES', messages);
	});

	socket.on('BUTTON_PUSHED', function(data) {
		console.log('button pushed ' + data.button);
		socket.broadcast.emit('BUTTON_PUSHED', data);
	});

	socket.on('POST_MESSAGE', function(data) {
		let msg = {
			from: data.from,
			message: data.message,
			date: data.date
		};

		messages.push(msg);
		socket.broadcast.emit('REFRESH_MESSAGES', messages);

		// write message to filesystem
		const fs = require('fs');
		fs.writeFile(`./_MESSAGES_/${getRandomFileName()}`, JSON.stringify(msg), err => {
			if (err) {
				console.error(err);
			}
		});

	});

	socket.on('GET_ALBUMS', function() {
		socket.emit('GET_ALBUMS', albums);
	});

});

async function getAlbums() {
	const ap = __dirname + path.join('/_ALBUMS_/');
	const results = [];
	const items = await readdir(ap);

	for (const item of items) {
		if (statSync(`${ap}/${item}`).isDirectory()) {
			results.push(item.replaceAll('_', ' '));
		}
	}

	return results;
}

async function getMessages() {
	const mp = __dirname + path.join('/_MESSAGES_/');
	const results = [];
	const items = await readdir(mp);

	for (const item of items) {
		fs.readFile(mp + item, 'utf8', function(err, message) {
			if (err) {
			  return console.log(err);
			}

			results.push(message);
		  });
	}

	return results;

	// fs.readdir(mp, (err, files) => {
	//   files.forEach(file => {
	// 	console.log(file);

	// 	fs.readFile(mp + file, 'utf8', function(err, data) {
	// 		if (err) {
	// 		  return console.log(err);
	// 		}
	// 		console.log(data);
	// 	  });
	//   });
	// });
}

function getRandomFileName() {
	var timestamp = new Date().toISOString().replace(/[-:.]/g, "");
	var random = ("" + Math.random()).substring(2, 8);
	var random_number = timestamp + random;

	return random_number;
}





// app.get('/getMessages', function(req, res) {
//   res.send(JSON.stringify(messages)) 
// });

// app.post('/sendmessage', function(req, res) {
//   let msg = {
//     from: req.body.from,
//     message: req.body.message
//   }

//   messages.push(msg)
//   //socket.broadcast.emit('REFRESH_MESSAGES', messages)
//   console.log(messages)
// });

server.listen(config.server.port, function() {
	console.log('Boarderly app is now listening for connections...');
});
