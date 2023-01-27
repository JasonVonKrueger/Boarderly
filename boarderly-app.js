/* Server for Boarderly */
require('dotenv').config(); 
const config = require('./lib/settings.json');
const http = require('http');
const express = require('express');
const socket_io = require('socket.io');
const path = require('path');
const fs = require('fs');
const Image = require('./lib/classes/Image');

let messages = [];
let tasks = [];
let albums = [];

// initialize the content folders
console.log('Initializing content directories...');
initContentDir('_BOARDS_');
initContentDir('_ALBUMS_');
initContentDir('_TASKS_');
initContentDir('_MESSAGES_');
initContentDir('_DEVICES_');

const image = new Image();

// load up the messages
console.log('Fetching message list...');
getSavedContent('messages').then(function(results) {
	messages = results;
});

// load up the tasks
console.log('Fetching task list...');
getSavedContent('tasks').then(function(results) {
	tasks = results;
});

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

	socket.on('REFRESH_TASKS', function() {
		io.to('poores').emit('REFRESH_TASKS', tasks);
	});

	socket.on('REFRESH_MESSAGES', function() {
		socket.broadcast.emit('REFRESH_MESSAGES', messages);
	});

	socket.on('BUTTON_PUSHED', function(data) {
		console.log('button pushed ' + data.button);
		io.to('poores').emit('BUTTON_PUSHED', data);
		//socket.broadcast.emit('BUTTON_PUSHED', data);
	});

	socket.on('POST_TASK', function(data) {
		const id = getRandomFileName();
		let task = {
			task: data.task,
			status: 'new',
			date: data.date,
			id: id
		}

		tasks.push(task);
		io.to('poores').emit('REFRESH_TASKS', tasks);
		//socket.broadcast.emit('REFRESH_TASKS', tasks);

		// write task to filesystem
		fs.writeFile(`./_TASKS_/${id}`, JSON.stringify(task), function(err) {
			if (err) {
				console.error(err);
			}
		});
	});

	socket.on('COMPLETE_TASK', function(data) {
		// update the task file task status
		const task_file = __dirname + path.join(`/_TASKS_/${data.id}`);

		fs.readFile(task_file, 'utf8', function (err, t) {
			if (err) {
				return console.log(err);
			}

			let task = JSON.parse(t);
			task.status = 'complete';

			fs.writeFile(task_file, JSON.stringify(task), function(err) {
				if (err) {
					console.error(err);
				}
			});

		});

		tasks = getSavedContent('tasks');
		io.to('poores').emit('REFRESH_TASKS', tasks);
		//socket.broadcast.emit('REFRESH_TASKS', tasks);
	});

	socket.on('POST_MESSAGE', function(data) {
		let msg = {
			from: data.from,
			message: data.message,
			date: data.date,
			token: data.token,
			file_name: data.file_name
		};

		messages.push(msg);
		io.to('poores').emit('REFRESH_MESSAGES', messages);
		//socket.broadcast.emit('REFRESH_MESSAGES', messages);

		// write message to filesystem
		const fs = require('fs');
		fs.writeFile(`./_MESSAGES_/${getRandomFileName()}`, JSON.stringify(msg), function(err) {
			if (err) {
				console.error(err);
			}
		});
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

	if (c === 'messages') {
		dir = __dirname + path.join('/_MESSAGES_/');

		items = await readdir(dir);
		for (const item of items) {
			fs.readFile(dir + item, 'utf8', function (err, message) {
				if (err) {
					return console.log(err);
				}

				results.push(JSON.parse(message));
			});
		}
	}

	if (c === 'tasks') {
		dir = __dirname + path.join('/_TASKS_/');

		// empty the tasks array
		tasks.length = 0;

		items = await readdir(dir);
		for (const item of items) {
			fs.readFile(dir + item, 'utf8', function (err, message) {
				if (err) {
					return console.log(err);
				}

				results.push(JSON.parse(message));
			});
		}
	}

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

server.listen(process.env.PORT, '192.168.1.161', function () {
	console.log('Boarderly app is now listening for connections...');
});
