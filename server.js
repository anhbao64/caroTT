const express = require('express');
const path = require('path');

const app = express();

// Static files
app.use(express.static(path.join(__dirname)));

// Route chính
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Port cho local và deploy
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server chạy tại cổng ${PORT}`);
});