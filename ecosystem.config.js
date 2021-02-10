module.exports = {
  apps : [{
    name: 'api_rijet',
    script: 'bin/www',

    // Options reference: https://pm2.keymetrics.io/docs/usage/application-declaration/
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    restart_delay: 3000,
    log_file: 'logs/general.log',
    log_date_format: 'YYYY-MM-DD HH:mm',
    env: {
      "NODE_ENV": "production"
    },
    env_dev: {
      "NODE_ENV": 'dev'
    }
  }]
};