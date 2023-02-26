const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    
    createProxyMiddleware('/api',{
      target: 'https://auto-attend-api.onrender.com/',
      changeOrigin: true,
    })
  );
};