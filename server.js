const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from the React app build directory
// The build folder is inside 'client/build' relative to server.js
app.use(express.static(path.join(__dirname, 'client/build')));

// Routes can be handled by React Router (SPA)
// So for any request that doesn't match a static file, return index.html
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Serving static files from: ${path.join(__dirname, 'client/build')}`);
});