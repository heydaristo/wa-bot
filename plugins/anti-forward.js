/**
 * Plugin: Anti Forward Label
 * Deskripsi: Menghapus label "Diteruskan berkali-kali" saat bot meneruskan pesan
 * Letakkan file ini di folder: plugins/
 * 
 * Credits: OurinMD - HyuuSATAN, Keisya, Danzzz, Lucky Archz
 */

const handler = async (m, { conn }) => {
    // Plugin ini berjalan di background, tidak perlu command khusus
}

/**
 * Fungsi helper: Kirim pesan TANPA label forward
 * Bisa digunakan di plugin lain dengan:
 * const { sendNoForward } = require('./anti-forward')
 */
async function sendNoForward(conn, jid, message, options = {}) {
    try {
        // Hapus semua konteks forward dari pesan
        const cleanMessage = removeForwardContext(message)
        return await conn.sendMessage(jid, cleanMessage, options)
    } catch (e) {
        console.error('[anti-forward] Error:', e)
    }
}

/**
 * Fungsi helper: Bersihkan konteks forward dari objek pesan
 */
function removeForwardContext(message) {
    if (!message || typeof message !== 'object') return message

    const cleaned = { ...message }

    // Hapus forwarding score
    if (cleaned.forwardingScore !== undefined)
if (cleaned.isForwarded !== undefined)
// Bersihkan contextInfo dari semua tipe pesan
    const messageTypes = [
        'extendedTextMessage',
        'imageMessage',
        'videoMessage',
        'audioMessage',
        'documentMessage',
        'stickerMessage',
        'contactMessage',
        'locationMessage',
        'buttonsMessage',
        'listMessage',
        'templateMessage'
    ]

    for (const type of messageTypes) {
        if (cleaned[type]?.contextInfo) {
            const ctx = { ...cleaned[type].contextInfo }
            // Hapus forward info tapi pertahankan reply/quote
cleaned[type] = { ...cleaned[type], contextInfo: ctx }
        }
    }

    return cleaned
}

/**
 * Patch global: Override fungsi copyNForward bawaan baileys
 * agar semua forward dari bot otomatis tanpa label
 */
function patchConnForward(conn) {
    if (!conn || conn.__antiForwardPatched) return

    const originalCopyNForward = conn.copyNForward?.bind(conn)

    if (originalCopyNForward) {
        conn.copyNForward = async (jid, message, forceForward = false, options = {}) => {
            try {
                // Ekstrak teks/konten dari pesan lalu kirim ulang sebagai pesan baru
                const text =
                    message?.message?.conversation ||
                    message?.message?.extendedTextMessage?.text ||
                    message?.message?.imageMessage?.caption ||
                    message?.message?.videoMessage?.caption ||
                    null

                if (text) {
                    // Kirim sebagai pesan teks baru (tanpa label forward)
                    return await conn.sendMessage(jid, { text }, options)
                }

                // Jika bukan teks (gambar, video, dll), gunakan copyNForward asli
                // tapi hapus forwardingScore
                if (message?.message) {
                    for (const key of Object.keys(message.message)) {
                        if (message.message[key]?.contextInfo) {
                            delete message.message[key].contextInfo.forwardingScore
                            delete message.message[key].contextInfo.isForwarded
                        }
                    }
                }

                return await originalCopyNForward(jid, message, forceForward, options)
            } catch (e) {
                console.error('[anti-forward patch] Error:', e)
                return await originalCopyNForward(jid, message, forceForward, options)
            }
        }

        conn.__antiForwardPatched = true
        console.log('[anti-forward] Patch copyNForward berhasil diterapkan ✅')
    }
}

// Auto-patch saat plugin di-load (jika conn tersedia secara global)
try {
    const { getDatabase } = require('../src/lib/database')
    // Patch akan dilakukan saat handler pertama kali dipanggil
} catch {}

handler.all = true        // Jalankan untuk semua pesan
handler.priority = 999    // Prioritas tertinggi (dijalankan pertama)

// Patch conn saat handler dipanggil pertama kali
const _originalHandler = handler
const wrappedHandler = async (m, { conn, ...rest }) => {
    patchConnForward(conn)
    return _originalHandler(m, { conn, ...rest })
}

wrappedHandler.all = true
wrappedHandler.priority = 999

module.exports = wrappedHandler
module.exports.sendNoForward = sendNoForward
module.exports.removeForwardContext = removeForwardContext
module.exports.patchConnForward = patchConnForward