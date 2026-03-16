const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

router.get('/health', (req, res) => {
    const state = mongoose.connection.readyState;
    const status = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
    };
    res.json({ 
        status: status[state], 
        db: mongoose.connection.name,
        host: mongoose.connection.host
    });
});

module.exports = router;
