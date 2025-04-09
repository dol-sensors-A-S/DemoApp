const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function (app) {
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
};