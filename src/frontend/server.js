const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const {join} = require("path");
const {createProxyMiddleware} = require('http-proxy-middleware');
const fs = require('fs');
const path = require('path');

const app = express();

const port = process.env.SERVER_PORT || 3000;
console.log(process.env);
app.use(
    '/api',
    createProxyMiddleware({
        target: process.env.REACT_APP_API_BASE_URL + '/api',
        changeOrigin: true,
        on: {
            proxyReq: (proxyReq, req, res) => {
                console.log(`[Proxy] Request: ${req.method} ${req.originalUrl}`);
                console.log(`[Proxy] Forwarding to: ${proxyReq.getHeader('host')}${proxyReq.path}`);
            },
            proxyRes: (proxyRes, req, res) => {
                console.log(`[Proxy] Response from: ${proxyRes.req.getHeader('host')}`);
                console.log(`[Proxy] Response status: ${proxyRes.statusCode}`);
            },
            error: (err, req, res) => {
                console.error(`[Proxy] Error on request to ${req.originalUrl}:`, err);
            },
        }
    })
);

app.use(morgan("dev"));


app.use(
    helmet({
        contentSecurityPolicy: false,
    })
);

// In index.html there is a script tag with placeholder values __AUTH0_.... etc.
// These placeholders are being overwritten with the environment variables on the node server.
fs.readFile(path.join(__dirname, 'build', 'index.html'), 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading index.html:', err);
        return;
    }
    console.log('Updating the Config in Index.html...');
    let result = data;
    // Replace placeholder with actual environment variable value
    result = result
        .replace('__AUTH0_DOMAIN__', process.env.REACT_APP_AUTH0_DOMAIN)
        .replace('__AUTH0_CLIENTID__', process.env.REACT_APP_AUTH0_CLIENTID)
        .replace('__AUTH0_AUDIENCE__', process.env.REACT_APP_AUTH0_AUDIENCE);

    // Write modified content to a new file or same file
    fs.writeFile(path.join(__dirname, 'build', 'index.html'), result, 'utf8', (err) => {
        if (err) {
            console.error('Error writing index.html:', err);
        }
    });
    console.log('Updated Config Successfully...');
});


app.use(express.static(join(__dirname, "build")));

app.get('*', (req, res) => res.sendFile(join(__dirname, 'build', 'index.html'), ));

app.listen(port, () => console.log(`Server listening on port ${port}`));
