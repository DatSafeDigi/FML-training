const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;
const CHAT_FILE = 'chat_history.txt';

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Thêm middleware để phục vụ các tệp tĩnh từ thư mục 'menu'
app.use('/menu', express.static(__dirname + '/menu'));

// Thêm middleware để phục vụ các tệp tĩnh từ thư mục 'game/2048'
app.use('/game/2048', express.static(__dirname + '/game/2048'));

// API để xử lý chat
app.post('/chat', (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'No message provided' });
    }
    // Lưu tin nhắn vào file
    fs.appendFile(CHAT_FILE, JSON.stringify({ message, date: new Date() }) + '\n', (err) => {
        if (err) {
            console.error('Error writing to chat file:', err);
            return res.status(500).json({ error: 'Failed to save message' });
        }
        // Gửi lại danh sách tất cả tin nhắn
        fs.readFile(CHAT_FILE, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading chat file:', err);
                return res.status(500).json({ error: 'Failed to load messages' });
            }
            const messages = data.trim().split('\n').map(line => JSON.parse(line));
            res.json({ result: 'success', messages });
        });
    });
});

app.get('/chat', (req, res) => {
    fs.readFile(CHAT_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading chat file:', err);
            return res.status(500).json({ error: 'Failed to load messages' });
        }
        const messages = data.trim().split('\n').map(line => JSON.parse(line));
        res.json({ result: 'success', messages });
    });
});

// Khởi động server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
