import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    // Load env from parent directory
    const env = loadEnv(mode, path.resolve(__dirname, '..'), '');
    const baseUrl = env.BASE_URL || 'http://localhost:3000';
    const devPort = new URL(env.DEV_FRONTEND_URL || 'http://localhost:3001').port;

    return {
        plugins: [react()],
        server: {
            port: parseInt(devPort),
            strictPort: true, // Fail if port is in use
            proxy: {
                '/api': {
                    target: baseUrl,
                    changeOrigin: true
                }
            }
        },
        define: {
            'process.env.BASE_URL': JSON.stringify(baseUrl)
        }
    }
});