var express = require('express')
app = express()
var server = require('http').createServer(app)
var io = require ('socket.io').listen(server)
var path = require('path')
var Vue = require('vue')
var fs = require('fs');
Vue.use(require('vue-resource'))
receptors = []
users = 0


// Pega a lista de músicas em formato JSON
//Poderia ter uma API pra fazer isso..
var songs = require('./public/songs.json')

//Isso aqui é para o vídeo, dados dos áudios do vídeo
var hometheater = JSON.parse(fs.readFileSync('public/hometheater.json', 'utf8'));

//Define a pasta pública com arquivos públicos
app.use('/public', express.static('public'))
server.listen(3500)
console.log('Server Started at 3500')

//INDEX
app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname, 'public/views/index.html'))
})

//WIPLAYER - página das músicas - controlador
app.get('/musicas' , function(req, res) {
	res.sendFile(path.join ( __dirname, 'public/views/wiplayer.html') )
})


//client - página do receptor
app.get('/client', function (req, res) {
	res.sendFile(path.join( __dirname , 'public/views/client.html'))
})

//retorna a música desejada, também poderia ter uma API pra fazer isso
app.get('/songs/:src', function (req, res) {
	res.sendFile(path.join ( __dirname , '/songs/',req.params.src))
})

//Página do vídeo
app.get('/home-theater' , function(req, res) {
	res.sendFile(path.join (__dirname, 'public/views/homet.html'))
})





//Socket io , nova conexão
io.on('connection', function (socket) {
	console.log('A user is connected')
	users++
	console.log('Usuarios conectados:' , users)

	//Quando usuário é desconectado , se for um receptor, irá deletar ele da lista de receptores
	socket.on('disconnect', function() {
		for (var i = 0; i < receptors.length; i++) {
			if (socket.id == receptors[i].id) {
				console.log('Um receptor saiu.')
				io.emit('deleteReceptor' , receptors[i])
				receptors.splice(i, 1)
			}
		}
		
		users -= 1
	});

	//Quando uma requisição getAllSongs é emitida, é eviada pro receptor a lista de todas as músicas
	socket.on('getAllSongs', function() {
		console.log('Enviando todas as músicas')
		socket.emit('allSongs', songs)
	});


	//Quando o play é clicado ele passa um JSON com ID da música, receptores a serem tocados e junções (ainda não imprementado)
	socket.on('playOnClick' , function(data) {
		console.log('Enviando dados da música:', data)
		if (data.receptors.length > 0 /*|| data.junctions.length > 0*/){
			if (data.receptors.length > 0) {
				for (i = 0; i < data.receptors.length; i++) {
					io.to(data.receptors[i]).emit('playMusic',songs[(data.musicID)-1])
				}

			} /*if (data.junctions.length > 0) {
				console.log('Juncoes',data.junctions)
				for (i = 0; i < data.junctions.length; i++) {
					for (j = 0; j < data.junctions[i].receptors.length; j ++) {
						io.to(data.junctions[i].receptors[j]).emit('playMusic', musicas[(data.musicID)-1])	
					}
				}
			}*/
		} else {

			io.emit('playMusic',songs[(data.musicID)-1])
		}
	});

	//Recebe a lista dos receptores que serão pausados
	socket.on('pauseOnClick', function (data) {	
		console.log('Botão pausar foi clicado')
		if (data.length > 0) {
			for (i = 0 ; i < data.length; i ++) {
				io.to(data[i]).emit('pauseSong')
			}
		} else {
			io.emit('pauseSong')
		}

	});	

	/*
	socket.on('pauseSelected', function (data) {
		console.log('Button pause clicked ', data)
		if (data.length > 0){
			for (i = 0; i < data.length; i++) {
				io.to(data[i]).emit('pauseSong')
			}
		} else {
			io.emit('pauseSong')
		}
	});	*/

	//PARA todos os receptores
	socket.on('stopOnClick', function() {
		console.log('Botão parar foi clicado')
		io.emit('stopSong')
	});

	//Aumenta o volume de todos os receptores
	socket.on('volumeUp', function() {
		console.log('Aumentando volume')
		io.emit('volumeUpSong')
	});

	//Diminui o volume de todos os receptores
	socket.on('volumeDown' , function() {
		console.log('Diminuindo volume')
		io.emit('volumeDownSong')
	});

	//Muta todos os receptores
	socket.on('mute', function() {
		console.log('Mutando receptores')
		io.emit('muteSong')
	});

	//Quando um receptor é conectado ele informa ao controlador
	socket.on('receptorOpen' , function(data) {
		console.log('Novo receptor' , data)
		io.emit('newReceptor', data)
	});

	//O controlador dará um nome pro novo receptor e retornará pro serve.js adicionar na lista de receptores
	socket.on('registerReceptor' , function(data) {
		console.log('Registrando receptor ' +data.id + ' com nome ' + data.name)
		receptors.push(data)
	})

	//Toca proxima música
	socket.on('playNext' , function(music) {
		console.log('Tocando próxima música')
		io.to(socket.id).emit('playMusic',songs[checkMusic(music.id,songs)])
	})


	//Funcão pro home-theater
	//São necessários 6 receptores (olhar isso, o 4 parece que não tem SOM)
	socket.on('playVideo' , function () {
		console.log('Reproduzindo o video')
		if (receptors.length == 5) {
			console.log("Tem 5 receptores")
			for (i = 0; i < receptors.length; i++) {
				io.to(receptors[i].id).emit('playMusic',hometheater[i])
			}
		}
	})

} )


//Função que checa se o ID da música é válido
function checkMusic(id, music) {
	if (id >= music.length) {
		return 0
	} else {
		return id
	}
}