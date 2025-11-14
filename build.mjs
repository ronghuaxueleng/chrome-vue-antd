import fs from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import { CRX_OUTDIR, CRX_CONTENT_OUTDIR, CRX_BACKGROUND_OUTDIR } from './globalConfig.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 执行命令
const exec = (command, description) => {
    console.log(`\n📦 ${description}...`)
    try {
        execSync(command, { stdio: 'inherit', cwd: process.cwd() })
        console.log(`✓ ${description}完成`)
    } catch (error) {
        console.error(`✗ ${description}失败`)
        throw error
    }
}

// 拷贝目录文件 (异步版本)
const copyDirectory = async (srcDir, destDir) => {
    // 检查源目录是否存在
    if (!existsSync(srcDir)) {
        console.log(`⚠ 源目录不存在，跳过: ${srcDir}`)
        return false
    }

    try {
        // 判断目标目录是否存在，不存在则创建
        if (!existsSync(destDir)) {
            await fs.mkdir(destDir, { recursive: true })
        }

        const files = await fs.readdir(srcDir)

        for (const file of files) {
            const srcPath = path.join(srcDir, file)
            const destPath = path.join(destDir, file)

            const stat = await fs.lstat(srcPath)

            if (stat.isDirectory()) {
                // 递归复制子目录
                await copyDirectory(srcPath, destPath)
            } else {
                // 复制文件
                await fs.copyFile(srcPath, destPath)
            }
        }

        console.log(`✓ 已复制: ${path.basename(srcDir)} -> ${path.basename(destDir)}`)
        return true
    } catch (error) {
        console.error(`✗ 复制目录失败: ${srcDir}`, error.message)
        throw error
    }
}

// 删除目录及文件 (异步版本)
const deleteDirectory = async (dir) => {
    if (!existsSync(dir)) {
        return
    }

    try {
        await fs.rm(dir, { recursive: true, force: true })
        console.log(`✓ 已删除临时目录: ${path.basename(dir)}`)
    } catch (error) {
        console.error(`✗ 删除目录失败: ${dir}`, error.message)
        throw error
    }
}

// 主构建流程
const build = async () => {
    console.log('🚀 开始构建 Chrome Extension...')

    try {
        // 步骤 1: 构建 popup
        exec('npx vite build -c vite.popup.config.js', '构建 popup')

        // 步骤 2: 构建 content script
        exec('npx vite build -c vite.content.config.js', '构建 content script')

        // 步骤 3: 构建 background script
        exec('npx vite build -c vite.background.config.js', '构建 background script')

        console.log('\n📂 合并构建产物...')

        // 源目录
        const contentOutDir = path.resolve(process.cwd(), CRX_CONTENT_OUTDIR)
        const backgroundOutDir = path.resolve(process.cwd(), CRX_BACKGROUND_OUTDIR)
        const outDir = path.resolve(process.cwd(), CRX_OUTDIR)

        // 确保输出目录存在
        if (!existsSync(outDir)) {
            await fs.mkdir(outDir, { recursive: true })
        }

        // 将复制源目录内的文件和目录全部复制到目标目录中
        await copyDirectory(contentOutDir, outDir)
        await copyDirectory(backgroundOutDir, outDir)

        console.log('\n🧹 清理临时文件...')

        // 删除临时目录
        await deleteDirectory(contentOutDir)
        await deleteDirectory(backgroundOutDir)

        console.log('\n✅ Chrome Extension 构建完成!')
        console.log(`📦 输出目录: ${outDir}`)
    } catch (error) {
        console.error('\n❌ 构建失败:', error.message)
        process.exit(1)
    }
}

// 执行构建
build()
