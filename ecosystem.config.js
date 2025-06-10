module.exports = {
  apps: [{
    name: "map-os",
    script: "serve",
    args: "-s -l 8280 dist",
    env: {
      NODE_ENV: "production",
      PM2_SERVE_PATH: 'dist',
      PM2_SERVE_PORT: 8280,
      PM2_SERVE_SPA: 'true'
    },
    watch: false,
    autorestart: true,
  }]
};