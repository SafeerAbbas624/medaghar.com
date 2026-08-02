module.exports = {
  apps: [
    {
      name: 'medaghar',
      cwd: '/var/www/medaghar.com',
      script: 'npm',
      args: 'run start -- -p 3002',
      env: {
        NODE_ENV: 'production',
        PORT: '3002',
      },
      instances: 2,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/www/medaghar.com/logs/err.log',
      out_file: '/var/www/medaghar.com/logs/out.log',
      log_file: '/var/www/medaghar.com/logs/combined.log',
      time: true,
    },
  ],
};