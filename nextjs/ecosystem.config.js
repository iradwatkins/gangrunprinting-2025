module.exports = {
  apps: [{
    name: 'gangrun-printing',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3100,
      DATABASE_URL: 'postgresql://gangrun:GangRun2024!@localhost:5432/gangrunprinting',
      NEXTAUTH_URL: 'https://gangrunprinting.com',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    },
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  }],

  deploy: {
    production: {
      user: 'root',
      host: '72.60.28.175',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/gangrunprinting.git',
      path: '/opt/gangrunprinting',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npx prisma generate && npx prisma migrate deploy && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
    },
  },
};