var express = require('express')
app = express()
var server = require('http').createServer(app)
var io = require ('socket.io').listen(server)
var path = require('path')
var Vue = require('vue')
Vue.use(require('vue-resource'))
receptors = []
users = 0
musicas = 
[
{
	id: 1,
	title: "Highway to Hell",
	author: "ACDC",
	duration: 284,
	genre: "Rock",
	src: "songs/highway.mp3"
},
{
	id: 2,
	title: "Ordinary Love",
	author: "U2",
	duration: 218,
	genre: "Rock",
	src: "songs/ordinary.mp3"
},
{
	id: 3,
	title: "Make War",
	author: "From First to Last",
	duration: 203,
	genre: "Rock",
	src: "songs/makewar.mp3"
},
{
	id: 4,
	title: "Eu sei de cor",
	author: "Marialia Mendonca",
	duration: 189,
	genre: "Sertanejo",
	src: "songs/seidecor.mp3"
}
]


app.use('/public', express.static('public'))
server.listen(3500)
console.log('Server Started at 3500')


app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname, 'public/views/index.html'))
})

app.get('/wiplayer' , function(req, res) {
	res.sendFile(path.join ( __dirname, 'public/views/wiplayer.html') )
})

app.get('/client', function (req, res) {
	res.sendFile(path.join( __dirname , 'public/views/client.html'))
})

app.get('/songs/:src', function (req, res) {
	res.sendFile(path.join ( __dirname , '/songs/',req.params.src))
})






io.on('connection', function (socket) {
	console.log('A user is connected')
	users++
	console.log('Usuarios conectados:' , users)
	socket.on('disconnect', function() {
		for (var i = 0; i < receptors.length; i++) {
			if (socket.id == receptors[i].id) {
				io.emit('deleteReceptor' , receptors[i])
				receptors.splice(i, 1)
			}
		}
		
		users -= 1
	});
	socket.on('getAllSongs', function() {
		socket.emit('allSongs', musicas)
	});
	socket.on('playOnClick' , function(data) {
		console.log('Button play clicked ', data)
		if (data.receptors.length > 0){
			for (i = 0; i < data.receptors.length; i++) {
				io.to(data.receptors[i]).emit('playMusic',musicas[(data.musicID)-1])
			}
		} else {
			io.emit('playMusic',musicas[(data.musicID)-1])
		}
	});
	socket.on('pauseOnClick', function () {
		console.log('Button pause clicked')
		io.emit('pauseSong')
	});	
	socket.on('stopOnClick', function() {
		console.log('Stop clicked')
		io.emit('stopSong')
	});
	socket.on('volumeUp', function() {
		io.emit('volumeUpSong')
	});
	socket.on('volumeDown' , function() {
		io.emit('volumeDownSong')
	});
	socket.on('mute', function() {
		io.emit('muteSong')
	});
	socket.on('receptorOpen' , function(data) {
		io.emit('newReceptor', data)
	});
	socket.on('registerReceptor' , function(data) {
		receptors.push(data)
	})
	socket.on('playNext' , function(music) {
		console.log(checkMusic(music.id,musicas))
		io.to(socket.id).emit('playMusic',musicas[checkMusic(music.id,musicas)])
	})

} )

function checkMusic(id, music) {
	if (id >= musicas.length) {
		return 0
	} else {
		return id
	}
}