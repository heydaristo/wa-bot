/**
 * Credits & Thanks to
 * Developer = Lucky Archz ( Zann )
 * Lead owner = HyuuSATAN
 * Owner = Keisya
 * Owner = Syura Salsabila
 * Designer = Danzzz
 *
 * JANGAN HAPUS/GANTI CREDITS & THANKS TO
 * JANGAN DIJUAL YA MEK
 *
 */

const config = require('../../config')
const { getParticipantJids } = require('../../src/lib/lidHelper')

const pluginConfig = {
    name: 'hidetag2',
    alias: ['h2', 'ht2'],
    category: 'group',
    description: 'Hidetag semua member grup',
    usage: '.h2 <text> atau reply pesan',
    example: '.h2 Pengumuman penting!',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 30,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
}

async function handler(m, { sock }) {
    const text = m.fullArgs?.trim()

    if (!text && !m.quoted) {
        return m.reply(
            `📢 *HIDETAG 2*\n\n` +
            `• \`${m.prefix}h2 <text>\`\n` +
            `• Reply pesan + \`${m.prefix}h2\``
        )
    }

    try {
        m.react('📢')
        const groupMeta = await sock.groupMetadata(m.chat)
        const users = getParticipantJids(groupMeta.participants || [])

        // FIX: Hapus fakeQuoted - penyebab card kontak + "Diteruskan berkali-kali"
        if (m.quoted) {
            const q = m.quoted
            const qMsg = q.message || {}
            const type = Object.keys(qMsg)[0]

            if (type === 'imageMessage') {
                const media = await q.download()
                return sock.sendMessage(m.chat, {
                    image: media,
                    caption: qMsg.imageMessage?.caption || '',
                    mentions: users
                })
            }

            if (type === 'videoMessage') {
                const media = await q.download()
                return sock.sendMessage(m.chat, {
                    video: media,
                    caption: qMsg.videoMessage?.caption || '',
                    mentions: users
                })
            }

            if (type === 'stickerMessage') {
                const media = await q.download()
                return sock.sendMessage(m.chat, {
                    sticker: media,
                    mentions: users
                })
            }

            if (type === 'audioMessage') {
                const media = await q.download()
                return sock.sendMessage(m.chat, {
                    audio: media,
                    mimetype: qMsg.audioMessage?.mimetype,
                    ptt: qMsg.audioMessage?.ptt || false,
                    mentions: users
                })
            }

            if (type === 'documentMessage') {
                const media = await q.download()
                return sock.sendMessage(m.chat, {
                    document: media,
                    fileName: qMsg.documentMessage?.fileName || 'file',
                    mimetype: qMsg.documentMessage?.mimetype,
                    mentions: users
                })
            }

            // Teks biasa / extended text
            const quotedText =
                q.text ||
                qMsg.conversation ||
                qMsg.extendedTextMessage?.text ||
                ''

            return sock.sendMessage(m.chat, {
                text: quotedText,
                mentions: users
            })
        }

        // ===== TEXT MODE =====
        await sock.sendMessage(m.chat, {
            text,
            mentions: users
        })

        m.react('✅')

    } catch (err) {
        m.react('❌')
        m.reply(`❌ *ERROR*\n\n${err.message}`)
    }
}

module.exports = {
    config: pluginConfig,
    handler
}