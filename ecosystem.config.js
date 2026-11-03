module.exports = {
  apps: [
    { name: 'api', script: 'npm', args: 'start', cwd: '/root/Nithyasoorya-full/backend',
      env: { NODE_ENV: 'production' } },
    { name: 'main-site', script: 'npm', args: 'start', cwd: '/root/Nithyasoorya-full/my-app',
      env: { NODE_ENV: 'production', PORT: 3000 } }
  ]
}
