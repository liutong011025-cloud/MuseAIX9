module.exports = {
  apps: [
    {
      name: 'story-writer',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/root/story-writer',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '800M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/log/pm2/story-writer-error.log',
      out_file: '/var/log/pm2/story-writer-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};




