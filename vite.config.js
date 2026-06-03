import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@services': path.resolve(__dirname, './src/services'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@assets': path.resolve(__dirname, './src/assets'),
      }
    },
    server: {
      port: 5173,
      open: true,
      cors: true,
      proxy: {
        '/api': {
          // target: 'https://dev.bentork.in:8080',
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('Proxying:', req.method, req.url, '->', options.target + req.url)
            })
          }
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      minify: 'esbuild',
      // terserOptions: {
      //   compress: {
      //     drop_console: mode === 'production',
      //     drop_debugger: mode === 'production'
      //   }
      // },
      esbuildOptions: mode === 'production' ? {
        drop: ['console', 'debugger'],
      } : {},
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            mui: ['@mui/material', '@mui/icons-material'],
            utils: ['axios', 'dayjs', 'crypto-js']
          }
        }
      }
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
    }
  }
})