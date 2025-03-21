const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api/placeholder',
    createProxyMiddleware({
      target: 'https://via.placeholder.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api/placeholder': '',
      },
    })
  );
};