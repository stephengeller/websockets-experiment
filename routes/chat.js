const express = require('express');
const router = express.Router();
const path = require('path');

router.get("/", (req, res) => {
    const indexFile = path.join(__dirname, '../public/index.html');
    console.log(indexFile);
    res.sendFile(indexFile);
});

module.exports = router;