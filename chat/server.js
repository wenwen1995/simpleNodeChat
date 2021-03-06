var fs = require('fs');//文件管理模块
var http = require('http'), //请求Node.js自带的http模块
    socketio = require('socket.io'); //请求Node.js的socket.io模块

var server = http.createServer(function(request,response){
	 response.writeHead(200,{'Content-Type':'text/html'});
	 response.end(fs.readFileSync(__dirname + '/index.html'));
}).listen(7788,function(){
	 console.log('Server running at http://localhost:7788')
});

socketio.listen(server).on('connection',function(socket){
	socket.on('message',function(msg){
		console.log('message received:',msg);
		socket.broadcast.emit('message',msg); //此信息广播到所有socket端
	});
});



