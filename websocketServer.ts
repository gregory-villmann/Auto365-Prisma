import { createServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

const httpServer = createServer();
const io = new SocketIOServer(httpServer);

io.on('connection', (socket: Socket) => {
	console.log('A client connected');

	socket.on('disconnect', () => {
		console.log('A client disconnected');
	});
});

httpServer.prependListener('request', (req, res) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
});

httpServer.listen(4000, () => {
	console.log('WebSocket server has started on http://localhost:4000');
});

export { io };
