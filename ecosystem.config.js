module.exports = {
  apps: [
    {
      name: 'mybot',
      script: './bot/src/bot.js',
      autorestart: true,
      max_memory_restart: '200M',
      instances: 1,
      exec_mode: 'fork',
      out_file: '/dev/stdout',
      error_file: '/dev/stderr',
      merge_logs: true,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
