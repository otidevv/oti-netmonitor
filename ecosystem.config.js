module.exports = {
  apps: [
    {
      name: 'oti-netmonitor',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      max_restarts: 5,
      restart_delay: 5000,
      env: {
        NODE_ENV: 'production',
        PORT: 3007,
        DATABASE_URL: 'postgresql://postgres:954040025@localhost:5432/netmonitor?schema=public',
      },
    },
  ],
};
