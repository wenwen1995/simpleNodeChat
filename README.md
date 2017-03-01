# simpleNodeChat

一个简单的基于node的聊天室。目前还未做样式的改变，结果如下：

现在命令行窗口输入命令，运行成功后会出现这样：

![](http://i1.piimg.com/567571/c7ec5c46b5a601d6.png)

在浏览器中输入http://localhost:7788(这里用7788，是自己定义的端口号)，如果成功会出现connected的字样，且打开network可以看到这样的信息：

![](http://p1.bqimg.com/567571/a7bf46fad2a95a89.png)

此为刚开始通信协议http升级为socket服务的过程，之后等到socket加载完成时，可以看到如下结果：
![](http://p1.bqimg.com/567571/6ff8f7ac3fe5647f.png)

至于如何查看协议升级为socket，以及其他关于network中socket的解释，可以到：[https://segmentfault.com/a/1190000007230919](https://segmentfault.com/a/1190000007230919)，觉得写得很棒！


具体最终的效果图如下：
![](https://github.com/wenwen1995/simpleNodeChat/tree/master/chat/gif/1.gif)

即实现了打开两个浏览器，实现即时的聊天通信，但是有点小问题，就是一方作为发送方，发送方页面可以看到之前发送的内容，另一方作为接收方，但接收方收到的内容却是每次覆盖前面的内容，代码写的有问题，仔细研究了下，之后变成这样就正确了，就类似于我们聊天的时候接收人和发送方都能看到各自发送的消息：

![](https://github.com/wenwen1995/simpleNodeChat/tree/master/chat/gif/2.gif)

接下来就是开始这个项目的步骤了：



1、首先要用express初始化一个chat的文件夹，,文件目录像这样：
![](http://om4hi8hop.bkt.clouddn.com/17-3-1/83667001-file_1488350721616_1843f.png)


2、然后因为用到socket.io,所以在package.json里面"dependencies"的内容最后加上一句

    "socket.io":"~1.3.5"

3、再使用npm install进行安装对应的依赖模块，就可以开始写页面了。

其中server.js，作为服务器实，现监听设置的端口，接受传递经过socket的信息

    server.js这么写：

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

理解：这段js里，变量server被赋值调用了http 模块提供的函数： createServer 。这个函数会返回 一个对象，这个对象有一个叫做 listen的方法，这个方法有一个数值参数， 指定这个 HTTP 服务器监听的端口号。


这里不知道为什么response.end(fs.readFileSync(__dirname + '/index.html'));是这样写的，app.js里面这句：

    app.use(express.static(path.join(__dirname, 'public')));

应该是默认路径存放在public下，此时，index.html按理来说应放在public目录下，但是放了后，页面找不到。。如果放在一级目录的下面，就行了。。不知道为什么原因，还得琢磨一下。

然后就来写index.html啦，这里遇到挺多坑的，一一阐述。

这是改后的index.html:

    <html>
     <head>
		<meta charset="UTF-8" http-equiv="Content-Type" content="text/html">
		<title>socket.IO chat</title>
    </head>
    <body>
      即将开始的聊天：&nbsp;
      <ul id="incomingChatMessages"></ul>
      <br />
      <input type="text" id="outgoingChatMessages">
      <input type="button" name="submit_btn" id="submit_btn" value="发言">
	  <script src="https://code.jquery.com/jquery-2.2.0.min.js"></script>
      <script type="text/javascript" src="socket.io/socket.io.js"></script>
	  <!-- <script src="http://localhost:7788/socket.io/socket.io.js"></script> -->
      <script type="text/javascript">
    	$(function(){
    		var iosocket = io.connect('http://localhost:7788/');
            var val;

    		iosocket.on('connect',function(){
    			$('#incomingChatMessages').append($('<li>Connected</li>'));
    		});

    		iosocket.on('message',function(message){
                var $li = $('<li>'+message+'</li>');
    			$('#incomingChatMessages').append($li);
    		});

    		iosocket.on('disconnect',function(){
    			$('#incomingChatMessages').append('<li>disconnected</li>');
    		});

    		$('#outgoingChatMessages').keypress(function(event){
               if(event.which == 13){ //按下回车键
                  event.preventDefault();
                  iosocket.send($('#outgoingChatMessages').val());
                  val = $('#outgoingChatMessages').val();
                  var $li = $('<li>'+val+'</li>');
                  $('#incomingChatMessages').append($li);
                  $('#outgoingChatMessages').val('');
               }
    		});

            $('#submit_btn').on('click',function(){
                iosocket.send($('#outgoingChatMessages').val());
                val = $('#outgoingChatMessages').val();
                var $li = $('<li>'+val+'</li>');
                $('#incomingChatMessages').append($li);
                $('#outgoingChatMessages').val('');
            });
    	})
      </script>
     </body>
    </html>

## 遇到的坑之一解决： ##

**其中之前不是有bug嘛，后来改动的部分，着重注意这里**
    
    //每次都创建一个新的li标签，然后将把接受和发送的消息填充进去，再将这个li标签每次都插入页面已经存在的ul标签里
    iosocket.on('message',function(message){
        var $li = $('<li>'+message+'</li>');
    	$('#incomingChatMessages').append($li);
    });

    //click里面的语句跟keypress里面的方法基本一致，把每次创建一个新的li标签，要发送的值塞进去，再将这个li每次插入ul标签里
    $('#submit_btn').on('click',function(){
         iosocket.send($('#outgoingChatMessages').val());
         val = $('#outgoingChatMessages').val();
         var $li = $('<li>'+val+'</li>');
         $('#incomingChatMessages').append($li);
         $('#outgoingChatMessages').val('');
     });

**而原来是这样的**

    iosocket.on('message',function(message){
          var $li = $('<li></li>');
    	   $('#incomingChatMessages').append($li).text(message);
    });

    $('#submit_btn').on('click',function(){
        iosocket.send($('#outgoingChatMessages').val());
        val = $('#outgoingChatMessages').val();
        var $li = $('<li></li>');
        $li.append(val);
        $('#incomingChatMessages').append($li)
        $('#outgoingChatMessages').val('');
     });

所以仔细看看还是有区别的，要之后多琢磨啊！

## 遇到的坑之二解决 ##

页面在引入jQuery文件和socket.io.js文件时遇到不少问题，总是报错，找不到对应的文件...

后来查阅了资料，就是如果node socket要使用jQuery文件的话，直接这样就好：

    <script src="https://code.jquery.com/jquery-2.2.0.min.js"></script>

因为jQuery文件来说是静态资源文件，这中间好像还牵扯到什么静态资源文件处理。。待我之后细细学习

还有就是引入socket.io.js文件，刚开始想这个文件是怎么来的，还特意去node_modules里面把这个文件提取出来，然后引入，后来发现好像不对，node这里会默认的去寻找这个文件，所以以下这两种写法都是可以的：
 
    <script type="text/javascript" src="socket.io/socket.io.js"></script>
    或者：
    <script type="text/javascript" src="/socket.io/socket.io.js"></script>
