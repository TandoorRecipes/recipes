#!/usr/bin/env node
/**
 * Dev server health check.
 *
 * Starts `vite dev` with --force (skip cache), waits for it to be ready,
 * then waits for deferred dep scan results, and verifies no failures.
 *
 * Exit 0 = healthy, Exit 1 = broken.
 *
 * Usage: node scripts/dev-server-healthcheck.mjs
 */

import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'

const MAX_WAIT_MS = 30_000
const POST_READY_WAIT_MS = 5000 // dep scan runs async after "ready in"

// Find a free port
const { createServer } = await import('node:net')
const port = await new Promise((resolve) => {
    const srv = createServer()
    srv.listen(0, () => {
        const { port } = srv.address()
        srv.close(() => resolve(port))
    })
})

let server
let serverOutput = ''

const FAILURE_PATTERNS = [
    'Failed to run dependency scan',
    'Skipping dependency pre-bundling',
    'is not exported under the conditions',
    'Build failed with',
]

function checkOutputForFailures() {
    for (const pattern of FAILURE_PATTERNS) {
        if (serverOutput.includes(pattern)) {
            return pattern
        }
    }
    return null
}

async function startServer() {
    return new Promise((resolve, reject) => {
        // --force skips dep cache so we always test a fresh scan
        server = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--force'], {
            cwd: new URL('..', import.meta.url).pathname,
            stdio: ['ignore', 'pipe', 'pipe'],
            env: { ...process.env, FORCE_COLOR: '0' },
        })

        let settled = false
        function settle(fn) {
            if (!settled) { settled = true; fn() }
        }

        server.stdout.on('data', (data) => {
            serverOutput += data.toString()
            if (serverOutput.includes('ready in') || serverOutput.includes(`localhost:${port}`)) {
                settle(() => resolve())
            }
        })

        server.stderr.on('data', (data) => {
            serverOutput += data.toString()
        })

        server.on('error', (e) => settle(() => reject(e)))
        server.on('exit', (code) => {
            if (code !== null && code !== 0) {
                settle(() => reject(new Error(`Vite exited with code ${code}:\n${serverOutput}`)))
            }
        })

        sleep(MAX_WAIT_MS).then(() => {
            settle(() => reject(new Error(`Vite did not start within ${MAX_WAIT_MS}ms:\n${serverOutput}`)))
        })
    })
}

async function checkHealth() {
    const baseUrl = `http://localhost:${port}`
    const errors = []

    // 1. Wait for the async dep scan to complete (it runs AFTER "ready in")
    console.log(`Waiting ${POST_READY_WAIT_MS / 1000}s for dependency scan...`)
    await sleep(POST_READY_WAIT_MS)

    // 2. Check server output for failure indicators
    const failure = checkOutputForFailures()
    if (failure) {
        errors.push(`Server output contains: "${failure}"`)
    }

    // 3. Fetch the main entry point to verify module transforms
    const mainUrl = `${baseUrl}/static/vue3/src/apps/tandoor/main.ts`
    try {
        const res = await fetch(mainUrl)
        if (!res.ok) {
            errors.push(`Main entry returned ${res.status}`)
        } else {
            const body = await res.text()
            if (body.includes('__BUNDLED_DEV__')) {
                errors.push('__BUNDLED_DEV__ variable leaked in main entry')
            }
        }
    } catch (e) {
        errors.push(`Failed to fetch main entry: ${e.message}`)
    }

    if (errors.length > 0) {
        console.error('❌ Dev server health check FAILED:')
        errors.forEach(e => console.error(`   - ${e}`))
        return false
    }

    console.log('✅ Dev server health check passed')
    return true
}

async function main() {
    try {
        console.log(`Starting Vite dev server on port ${port} (--force, no cache)...`)
        await startServer()
        console.log('Vite ready, checking health...')
        const healthy = await checkHealth()
        process.exit(healthy ? 0 : 1)
    } catch (e) {
        console.error(`❌ ${e.message}`)
        process.exit(1)
    } finally {
        if (server) {
            server.kill('SIGTERM')
            await sleep(500).catch(() => {})
            if (server && !server.killed) server.kill('SIGKILL')
        }
    }
}

main()
