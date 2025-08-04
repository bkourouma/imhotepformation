// Startup script for Azure App Service
process.env.NODE_ENV = 'production';
console.log('🚀 Starting application in production mode');
console.log('📁 Current directory:', process.cwd());
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
console.log('🌐 PORT:', process.env.PORT);

// Import and start the server
import('./server/server.js');
