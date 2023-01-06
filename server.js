/* Server for Boarderly */
const config = require('./lib/settings.json');
const http = require('http');
const express = require('express');
const socket_io = require('socket.io');
const path = require('path');

const messages = [];
let albums = [];

// get a list of albums and store in an array for future use
console.log('Fetching photo album list...');
const { statSync } = require('fs');
const { readdir } = require('fs').promises;
getAlbums('./_ALBUMS_').then(function(results) {
    albums = results
	console.log(albums)
});

const app = express();
app.use(express.static('public'));
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
	});

	socket.on('GET_ALBUMS', function() {
		socket.emit('GET_ALBUMS', albums);
	});

});



 async function getAlbums(p) {
	const results = [];
    const items = await readdir(p);

    for (const item of items) {
        if (statSync(`${p}/${item}`).isDirectory()) {
            results.push(item.replaceAll('_', ' '));
        }
    }

    return results;
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

server.listen(9980, function() {
  console.log('Boarderly app is now listening for connections...');
});


