/* Server for Boarderly */
require('dotenv').config(); 
const http = require('http');
const express = require('express');
const socket_io = require('socket.io');
const path = require('path');
const fs = require('fs');
const ImageWorker = require('./lib/classes/ImageWorker');
const EventWorker = require('./lib/classes/EventWorker');
const MessageWorker = require('./lib/classes/MessageWorker');

// file stores
const __devices = '.stores/devices';
const __messages = '.stores/messages';
const __events = '.stores/events';
const __albums = '.stores/albums';
const __boards = '.stores/boards';

let messages = [];
let events = [];
let albums = [];

// initialize the content folders
console.log('Initializing content directories...');
initContentDir(__boards);
initContentDir(__albums);
initContentDir(__events);
initContentDir(__messages);
initContentDir(__devices);

const message_worker = new MessageWorker(__messages);
const event_worker = new EventWorker(__events);
const image_worker = new ImageWorker(__albums);

// load up the messages
console.log('Fetching message list...');
message_worker.load().then(function(results) { messages = results });

// load up the events
console.log('Fetching event list...');
event_worker.load().then(function(results) { events = results });

// load up the photo albums
console.log('Fetching photo album list...');
getSavedContent('albums').then(function(results) { albums = results });

// create some extra routes
const app = express();
app.use('/', express.static('./webclients/board'));
app.use('/remote', express.static('./webclients/remote'));
app.use('/message', express.static('./webclients/message'));
app.use('/albums', express.static(__albums));
app.use('/devices', express.static(__devices));
app.use('/resources', express.static('./resources'));
app.use('/shoelace', express.static('node_modules/@shoelace-style/shoelace'));
app.get('/api/gettoken', function(req, res) { 
	res.send( { answer: generateToken() }); 
});
app.use(express.json());

const server = http.Server(app);
const io = socket_io(server);
const talkers = [];

// fire up the sockets...
io.on('connection', function(socket) {
	// join the assigned room
	//socket.join('poores');

	// handle talkie events
	socket.on('NEW_TALKER', function(data) {
		console.log(`${data} joined to talk.`);
		talkers.push(data);
		io.emit('NEW_TALKER', data);
	});

	socket.on('TALKIE_MESSAGE', function(msg) {
		console.log('got talkie message')
		//io.emit('TALKIE_MESSAGE', msg);
		socket.broadcast.emit('TALKIE_MESSAGE', msg);
	});

	socket.on('TALKIE_DISCONNECT', function() {
		// io.emit('TALKIE_USERS', talkie_users);
		// console.log("user disconnected");
	});





	socket.on('GET_MESSAGES', function() {
		io.emit('REFRESH_MESSAGES', messages);
	});

	socket.on('REFRESH_MESSAGES', function() {
		// return sorted by date
		io.emit('REFRESH_MESSAGES', messages.sort(function(a, b) {
			if (b.date < a.date) return 1;
			else if (a.date < b.date) return -1;
			else return 0;
		}));
	});

	socket.on('POST_MESSAGE', function(data) {
		const id = getRandomFileName();
		message_worker.create(id, data);
		//message_worker.load().then(function(results) { messages = results; });
		messages.push(data);
		io.emit('REFRESH_MESSAGES', messages);
	});

	socket.on('BUTTON_PUSHED', function(data) {
		console.log('button pushed ' + data.button);
		io.emit('BUTTON_PUSHED', data);
		//socket.broadcast.emit('BUTTON_PUSHED', data);
	});

	socket.on('REFRESH_PLANNER_EVENTS', function() {
		event_worker.load().then(function(results) { events = results });
		
		// return sorted by date
		io.emit('REFRESH_PLANNER_EVENTS', events.sort(function(a, b) {
			if (b.date < a.date) return 1;
			else if (a.date < b.date) return -1;
			else return 0;
		}));
	});

	socket.on('POST_PLANNER_EVENT', function(data) {
		const id = getRandomFileName();
		event_worker.create(id, data);

		events.push(data);
		io.emit('REFRESH_PLANNER_EVENTS', events);
	});

	socket.on('DELETE_PLANNER_EVENT', function(data) {
		// update the event file event status
		event_worker.delete(data.id);

		events = getSavedContent('events');
		io.emit('REFRESH_PLANNER_EVENTS', events);
		//socket.broadcast.emit('REFRESH_eventS', events);
	});

	socket.on('GET_ALBUMS', function() {
		io.emit('GET_ALBUMS', albums)
	});

	// handle device registration
	socket.on('REGISTER_DEVICE', function(data, callback) {
		fs.mkdir(`${__devices}/${data.token}`, function(error) {
			if (error) console.log(error)
		})

		// convert the base64 string and save as an image
		const buffer = Buffer.from(data.image.split(';base64,')[1], 'base64')

		// resize it
		const path = `${__devices}/${data.token}/${data.file_name}`;
		image_worker.shrink(buffer, path, 90, 90)
	});

	socket.on('CONNECT_REMOTE', function() {
		io.emit('CONNECT_REMOTE')
	})

	socket.on('NUMGAME_GUESS', function(data) {
		io.emit('NUMGAME_GUESS', data)
	})
});

async function getSavedContent(c) {
	const { readdir } = require('fs').promises;
	const { statSync } = require('fs');
	const results = [];
	let dir = null, items = null;

	if (c === 'albums') {
		// get a list of all pictures and the albums
		// each directory is an album
		dir = __dirname + path.join('/.stores/albums/');

		items = await readdir(dir);
		for (const item of items) {
			if (statSync(`${dir}/${item}`).isDirectory()) {
				fs.readdir(`${dir}/${item}`, function(error, files) {
					if (error) console.log(error);
					files.forEach(function(file) {
						if (file.indexOf('.jpg') > -1 || file.indexOf('.png') > -1) {
							let o = {};
							o.album = item;
							o.name = file;
							//o.css_name = item.replaceAll(' ', '-').replaceAll('_', '-').toLowerCase();
							
							results.push(o);
						}
					});
				})
			}
		}
	}
	
	return results;
}

function generateToken(n = 32) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = '';
    for (var i = 0; i < n; i++) {
        token += chars[Math.floor(Math.random() * chars.length)];
    }
  
    return token;
}

function getRandomFileName() {
	let timestamp = new Date().toISOString().replace(/[-:.]/g, '');
	let random = ('' + Math.random()).substring(2, 8);
	let random_number = timestamp + random;

	return random_number;
}

function initContentDir(dir) {
	const path = `./${dir}`

	if (!fs.existsSync(path)) {
		fs.mkdirSync(path);
		console.log(`Created directory ${dir}`);
	}
}

server.listen(process.env.PORT, function () {
	console.log('Boarderly app is now listening for connections...');
});
