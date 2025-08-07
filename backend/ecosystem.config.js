module.exports = {
  apps: [{
    name: 'blog-backend',
    script: 'app.js',
    cwd: '/var/www/blog/backend',  // Monorepo path
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/www/blog/logs/err.log',
    out_file: '/var/www/blog/logs/out.log',
    log_file: '/var/www/blog/logs/combined.log',
    time: true
  }]
};
