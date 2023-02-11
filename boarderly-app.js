/* Server for Boarderly */
require('dotenv').config(); 
const http = require('http');
const express = require('express');
const socket_io = require('socket.io');
const path = require('path');
const fs = require('fs');
const ImageWorker = require('./lib/classes/ImageWorker');
const TaskWorker = require('./lib/classes/TaskWorker');
const MessageWorker = require('./lib/classes/MessageWorker');

// file stores
const __devices = '.stores/devices';
const __messages = '.stores/messages';
const __tasks = '.stores/tasks';
const __albums = '.stores/albums';
const __boards = '.stores/boards';

let messages = [];
let tasks = [];
let albums = [];

// initialize the content folders
console.log('Initializing content directories...');
initContentDir(__boards);
initContentDir(__albums);
initContentDir(__tasks);
initContentDir(__messages);
initContentDir(__devices);

const message_worker = new MessageWorker(__messages);
const task_worker = new TaskWorker(__tasks);
const image_worker = new ImageWorker(__albums);

// load up the messages
console.log('Fetching message list...');
message_worker.load().then(function(results) { messages = results; });

// load up the tasks
console.log('Fetching task list...');
task_worker.load().then(function(results) { tasks = results; });

// load up the photo albums
console.log('Fetching photo album list...');
getSavedContent('albums').then(function(results) { albums = results; });

// create some extra routes
const app = express();
app.use('/', express.static('./webclients/board'));
app.use('/remote', express.static('./webclients/remote'));
app.use('/message', express.static('./webclients/message'));
app.use('/albums', express.static(__albums));
app.use('/devices', express.static(__devices));
app.use('/resources', express.static('./resources'));
app.get('/api/gettoken', function(req, res) { 
	res.send( { answer: generateToken() }); 
});
app.use(express.json());

const server = http.Server(app);
const io = socket_io(server);

// fire up the sockets...
io.on('connection', function (socket) {
	// join the assigned room
	socket.join('poores');

	socket.on('GET_MESSAGES', function() {
		io.to('poores').emit('REFRESH_MESSAGES', messages);
	});

	socket.on('REFRESH_MESSAGES', function() {
		// return sorted by date
		io.to('poores').emit('REFRESH_MESSAGES', messages.sort(function(a, b) {
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
		io.to('poores').emit('REFRESH_MESSAGES', messages);
	});

	socket.on('BUTTON_PUSHED', function(data) {
		console.log('button pushed ' + data.button);
		io.to('poores').emit('BUTTON_PUSHED', data);
		//socket.broadcast.emit('BUTTON_PUSHED', data);
	});

	socket.on('REFRESH_TASKS', function() {
		task_worker.load().then(function(results) { tasks = results; });
		
		// return sorted by date
		io.to('poores').emit('REFRESH_TASKS', tasks.sort(function(a, b) {
			if (b.date < a.date) return 1;
			else if (a.date < b.date) return -1;
			else return 0;
		}));
	});

	socket.on('POST_TASK', function(data) {
		const id = getRandomFileName();
		task_worker.create(id, data);

		tasks.push(data);
		io.to('poores').emit('REFRESH_TASKS', tasks);
	});

	socket.on('COMPLETE_TASK', function(data) {
		// update the task file task status
		task_worker.complete(data.id);

		tasks = getSavedContent('tasks');
		io.to('poores').emit('REFRESH_TASKS', tasks);
		//socket.broadcast.emit('REFRESH_TASKS', tasks);
	});

	socket.on('GET_ALBUMS', function() {
		io.to('poores').emit('GET_ALBUMS', albums);
	});

	// handle device registration
	socket.on('REGISTER_DEVICE', function(data, callback) {
		fs.mkdir(`${__devices}/${data.token}`, function(error) {
			if (error) console.log(error); 
		});

		// convert the base64 string and save as an image
		const buffer = Buffer.from(data.image.split(';base64,')[1], 'base64');

		// resize it
		const path = `${__devices}/${data.token}/${data.file_name}`;
		image_worker.shrink(buffer, path, 90, 90);
	});
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
