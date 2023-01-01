/* Server for Boarderly */

const http = require('http');
const express = require('express');
const socket_io = require('socket.io');
const path = require('path');
const messages = [];
let current_page_index = 0;

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
    }
  
    messages.push(msg);

		socket.broadcast.emit('REFRESH_MESSAGES', messages);
	})

});




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

server.listen(9980, '0.0.0.0', () =>
  console.log('Boarderly app is now listening for connections...'),
);


