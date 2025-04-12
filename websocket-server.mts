import { WebSocketServer, WebSocket, RawData } from 'ws';
import fetch from 'node-fetch';
import * as dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3001;

const wss = new WebSocketServer({
    port: Number(PORT),
});

wss.on('connection', function connection(ws: WebSocket, request) {
    const clientIP = request.socket.remoteAddress;
    console.log(`🟡 Connection attempt from ${clientIP}`);

    console.log('Client connected');

    ws.on('message', async function message(data: RawData) {
        const input = data.toString();
        console.log('Received:', input);

        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'AI NPC Chatbot',
            },
            body: JSON.stringify({
                model: 'meta-llama/llama-3.3-70b-instruct:free',
                messages: [{ role: 'user', content: input }],
                stream: false
            }),
        });

        const json = await res.json() as any;
        const reply = json.choices?.[0]?.message?.content || "No response from AI.";

        ws.send(reply);
        console.log('Sent reply:', reply);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

console.log(`WebSocket server running on port ${PORT}`);
