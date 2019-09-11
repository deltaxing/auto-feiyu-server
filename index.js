var express = require('express');
var app = express();
var server = require('http').Server(app);
var cors = require('cors');
var io = require('socket.io')(server);
const SocketIOFile = require('socket.io-file');

server.listen(3001);

//gets and uses, relative order maters,
app.get('/open', function (req, res) {
    io.to('BeiHang').send('open');
    res.send('OK');
  });

app.use(express.static('public'));
app.use(cors);

io.on('connection', socket => {
    socket.on('join', (name, fn) => {
        socket.join(name, (err)=>{
            if(err)
                return;
            
            let rooms = Object.keys(socket.rooms);
            socket.to(rooms[1]).send("a user joinin");               
            
            if(fn)
                fn('joined into ' + name );       
        });
        
    });
    console.log('a user connected');

    socket.on('message',(msg)=>{
        let rooms = Object.keys(socket.rooms);
        socket.to(rooms[1]).send(msg);
        console.log(msg);
    }); 

    // File Transfer
    var uploader = new SocketIOFile(socket, {
		// uploadDir: {			// multiple directories
		// 	music: 'data/music',
		// 	document: 'data/document'
		// },
		uploadDir: 'data',							// simple directory
		accepts: ['audio/mpeg', 'audio/mp3'],		// chrome and some of browsers checking mp3 as 'audio/mp3', not 'audio/mpeg'
		maxFileSize: 4194304, 						// 4 MB. default is undefined(no limit)
		chunkSize: 10240,							// default is 10240(1KB)
		transmissionDelay: 0,						// delay of each transmission, higher value saves more cpu resources, lower upload speed. default is 0(no delay)
		overwrite: true 							// overwrite file if exists, default is true.
	});
	uploader.on('start', (fileInfo) => {
		console.log('Start uploading');
		console.log(fileInfo);
	});
	uploader.on('stream', (fileInfo) => {
		console.log(`${fileInfo.wrote} / ${fileInfo.size} byte(s)`);
	});
	uploader.on('complete', (fileInfo) => {
		console.log('Upload Complete.');
		console.log(fileInfo);
	});
	uploader.on('error', (err) => {
		console.log('Error!', err);
	});
	uploader.on('abort', (fileInfo) => {
		console.log('Aborted: ', fileInfo);
	});
});

