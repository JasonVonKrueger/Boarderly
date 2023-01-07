/* Server for Boarderly */
const config = require('./lib/settings.json');
const http = require('http');
const express = require('express');
const socket_io = require('socket.io');
const path = require('path');
const fs = require('fs');

let messages = [];
let albums = [];

// load up the messages
console.log('Fetching message list...');
getSavedContent('messages').then(function(results) {
	messages = results;
	//console.log(messages);
});

// load up the photo albums
console.log('Fetching photo album list...');
getSavedContent('albums').then(function(results) {
	albums = results;
	//console.log(albums);
});

const app = express();
app.use('/', express.static('./webclients/board'));
app.use('/remote', express.static('./webclients/remote'));
app.use('/message', express.static('./webclients/message'));
app.use('/resources', express.static('./resources'));
app.use(express.json());

const server = http.Server(app);
const io = socket_io(server);

io.on('connection', function(socket) {
	console.log('a user connected');

	socket.on('GET_MESSAGES', function() {
		io.emit('REFRESH_MESSAGES', messages);
		//socket.broadcast.emit('REFRESH_MESSAGES', messages)

		console.log(messages);
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


async function getSavedContent(c) {
	const { readdir } = require('fs').promises;
	const { statSync } = require('fs');
	const results = [];
	let dir = null, items = null;

	if (c === 'messages') {
		dir = __dirname + path.join('/_MESSAGES_/');

		items = await readdir(dir);
		for (const item of items) {
			fs.readFile(dir + item, 'utf8', function(err, message) {
				if (err) {
				  return console.log(err);
				}
	
				results.push(JSON.parse(message));
			  });
		}
	}

	if (c === 'albums') {
		dir = __dirname + path.join('/_ALBUMS_/');

		items = await readdir(dir);
		for (const item of items) {
			if (statSync(`${dir}/${item}`).isDirectory()) {
				results.push(item.replaceAll('_', ' '));
			}
		}
	}
	
	return results;
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
