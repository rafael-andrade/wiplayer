var express = require('express')
app = express()
var server = require('http').createServer(app)
var io = require ('socket.io').listen(server)
var path = require('path')


server.listen(3500)

app.get('/' , function(req, res) {
	res.sendFile(path.join ( __dirname, 'views/index.html') )
})

app.get('/client', function (req, res) {
	res.sendFile(path.join( __dirname , 'views/client.html'))
})

app.get('/myway.mp3', function (req, res) {
	res.sendFile(path.join ( __dirname , 'myway.mp3'))
})	





io.on('connection', function (socket) {
	console.log('A user is connected')
	socket.on('message', function(data) {
		console.log(data)
	});
	socket.on('playOnClick' , function(data) {
		console.log('Button play clicked ', data)
		io.emit('playMusic',data)
	});
	socket.on('pauseOnClick', function () {
		console.log('Button pause clicked')
		io.emit('pauseMusic')
	});

} )