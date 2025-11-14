import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { CRX_OUTDIR } from './globalConfig'
export default defineConfig({
    build: {
        outDir: CRX_OUTDIR,
        rollupOptions: {
            input: {
                option: path.resolve(__dirname, 'option.html'),
                popup: path.resolve(__dirname, 'popup.html'),
            }
        }
    },
    server: {
        port: 3000,
        open: '/popup.html',
        proxy: {
            '/api': {
                target: 'http://127.0.0.1/',
                changeOrigin: true,
            },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    plugins: [vue(
        {
            template: {
                compilerOptions: {
                    isCustomElement: (tag) => [
                        'el-config-provider',
                        'el-input',
                        'el-button',
                        'el-dialog'
                    ].includes(tag),
                }
            }
        }
    )],
})
