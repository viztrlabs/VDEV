module.exports = {
  apps: [
    {
      name: 'viztr-cirrus',
      script: 'cirrus.js',
      args: '--StreamerPort 8888 --HttpPort 80 --SFUPort 8889',
      cwd: 'C:\\Program Files\\Epic Games\\UE_5.4\\Engine\\Plugins\\Media\\PixelStreaming\\Resources\\WebServers\\SignallingWebServer',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 80
      },
      env_production: {
        NODE_ENV: 'production'
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      out_file: 'C:\\viztr-logs\\cirrus-out.log',
      error_file: 'C:\\viztr-logs\\cirrus-error.log',
      merge_logs: true,
      time: true
    }
  ]
};