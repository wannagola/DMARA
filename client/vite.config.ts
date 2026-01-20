import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0', // 👈 [필수] 모든 IP로부터의 접속을 허용합니다.
    port: 5173,
    strictPort: true,
    allowedHosts: [  // 👈 [필수] Vite 6 보안 정책으로, 이 도메인들을 허용해야 합니다.
      '54.180.118.183.nip.io',
      '54.180.118.183'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})