/* Server for Boarderly */
require('dotenv').config(); 
const config = require('./lib/settings.json');
const http = require('http');
const express = require('express');
const socket_io = require('socket.io');
const path = require('path');
const fs = require('fs');
const Image = require('./lib/classes/Image');
const TaskWorker = require('./lib/classes/TaskWorker');
const MessageWorker = require('./lib/classes/MessageWorker');

let messages = [];
let tasks = [];
let albums = [];

// initialize the content folders
console.log('Initializing content directories...');
initContentDir('_BOARDS_');
initContentDir('_ALBUMS_');
initContentDir('.stores/tasks');
initContentDir('.stores/messages');
initContentDir('_DEVICES_');

const message_worker = new MessageWorker();
const task_worker = new TaskWorker();
const image = new Image();

// load up the messages
console.log('Fetching message list...');
message_worker.load().then(function(results) { messages = results; });
// getSavedContent('messages').then(function(results) {
// 	messages = results;
// });

// load up the tasks
console.log('Fetching task list...');
task_worker.load().then(function(results) { tasks = results; });

/* getSavedContent('tasks').then(function(results) {
	tasks = results;
}); */

// load up the photo albums
console.log('Fetching photo album list...');
getSavedContent('albums').then(function(results) {
	albums = results;
});

const app = express();
app.use('/', express.static('./webclients/board'));
app.use('/remote', express.static('./webclients/remote'));
app.use('/message', express.static('./webclients/message'));
app.use('/albums', express.static('./_ALBUMS_'));
app.use('/devices', express.static('./_DEVICES_'));
app.use('/resources', express.static('./resources'));
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
		//socket.broadcast.emit('REFRESH_MESSAGES', messages);
		io.to('poores').emit('REFRESH_MESSAGES', messages);
	});

	socket.on('POST_MESSAGE', function(data) {
		const id = getRandomFileName();
		message_worker.create(id, data);
		//message_worker.load().then(function(results) { messages = results; });
		messages.push(message);
		io.to('poores').emit('REFRESH_MESSAGES', messages);
	});

	socket.on('BUTTON_PUSHED', function(data) {
		console.log('button pushed ' + data.button);
		io.to('poores').emit('BUTTON_PUSHED', data);
		//socket.broadcast.emit('BUTTON_PUSHED', data);
	});

	socket.on('REFRESH_TASKS', function() {
		task_worker.load().then(function(results) { tasks = results; });
		io.to('poores').emit('REFRESH_TASKS', tasks);
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
		fs.mkdir(`./_DEVICES_/${data.token}`, function(error) {
			if (error) console.log(error); 
		});

		// convert the base64 string and save as an image
		const buffer = Buffer.from(data.image.split(';base64,')[1], 'base64');

		// resize it
		const path = `./_DEVICES_/${data.token}/${data.file_name}`;
		const avatar = new Image();
		avatar.shrink(buffer, path, 90, 90);

		// fs.writeFile(`./_DEVICES_/${data.token}/${data.file_name}`, buffer, function(err) {
		// 	callback({ message: err ? "failure" : "success" });
		// });

		
	});
});

async function getSavedContent(c) {
	const { readdir } = require('fs').promises;
	const { statSync } = require('fs');
	const results = [];
	let dir = null, items = null;

	// if (c === 'messages') {
	// 	dir = __dirname + path.join('/.stores/messages/');

	// 	items = await readdir(dir);
	// 	for (const item of items) {
	// 		fs.readFile(dir + item, 'utf8', function (err, message) {
	// 			if (err) {
	// 				return console.log(err);
	// 			}

	// 			results.push(JSON.parse(message));
	// 		});
	// 	}
	// }

	// if (c === 'tasks') {
	// 	dir = __dirname + path.join('/.stores/tasks/');

	// 	// empty the tasks array
	// 	tasks.length = 0;

	// 	items = await readdir(dir);
	// 	for (const item of items) {
	// 		fs.readFile(dir + item, 'utf8', function(err, task) {
	// 			if (err) {
	// 				console.log(err);
	// 			}

	// 			results.push(JSON.parse(task));
	// 		});
	// 	}
	// }

	if (c === 'albums') {
		// get a list of all pictures and the albums
		// each directory is an album
		dir = __dirname + path.join('/_ALBUMS_/');

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
