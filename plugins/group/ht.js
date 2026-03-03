const { getParticipantJids } = require('../../src/lib/lidHelper')

const pluginConfig = {
    name: ['ht', 'hidetag'],
    category: 'group',
    description: 'Hidetag dengan support reply pesan (teks/media) & tag 1 user',
    usage: '.ht [pesan] | .ht @user [pesan] | reply pesan lalu .ht',
    example: '.ht halo semua | .ht @Budi hai | reply lalu .ht',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 30,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: false
}

/**
 * Ambil JID spesifik dari teks mention (@628xxx)
 * Sekaligus hapus @angka dari teks (hidden tag)
 */
function extractAndCleanMentions(rawText, participants) {
    if (!rawText) return { jids: [], cleanText: '' }

    const jids = []

    const cleanText = rawText.replace(/@(\d+)/g, (match, jidNum) => {
        const found = participants.find(p => {
            const num = (p.id || '').split('@')[0].replace(/[^0-9]/g, '')
            return num === jidNum
        })
        if (found && !jids.includes(found.id)) {
            jids.push(found.id)
        }
        return ''
    }).replace(/\s+/g, ' ').trim()

    return { jids, cleanText }
}

async function handler(m, { sock }) {
    try {
        const groupMeta = await sock.groupMetadata(m.chat)
        const participants = groupMeta.participants || []
        const allMentions = getParticipantJids(participants)

        const quoted = m.quoted
        const rawText = m.fullArgs?.trim()

        // Ekstrak mention & bersihkan teks
        const { jids: specificJids, cleanText: text } = extractAndCleanMentions(rawText, participants)

        // Jika ada mention spesifik → tag hanya user itu, jika tidak → tag semua
        const mentions = specificJids.length > 0 ? specificJids : allMentions

        // ===== TAMPILKAN HELP JIKA TIDAK ADA ARGUMEN & TIDAK ADA QUOTE =====
        if (!quoted && !text && specificJids.length === 0) {
            return m.reply(
                `📢 *HIDETAG*\n\n` +
                `• \`${m.prefix}ht <pesan>\` → tag semua member\n` +
                `• \`${m.prefix}ht @user <pesan>\` → tag 1 user saja (hidden)\n` +
                `• Reply pesan lalu \`${m.prefix}ht\` → forward + tag semua\n` +
                `• Reply pesan lalu \`${m.prefix}ht @user\` → forward + tag 1 user\n\n` +
                `Support: teks, gambar, video, sticker, audio, dokumen`
            )
        }

        // ===== HAPUS PESAN COMMAND USER (selalu di semua kondisi) =====
        try {
            await sock.sendMessage(m.chat, { delete: m.key })
        } catch (_) {
            // Abaikan jika gagal hapus (misal bot bukan admin)
        }

        // ===== REPLY MODE =====
        if (quoted) {
            const qMsg = quoted.message || {}
            const type = Object.keys(qMsg)[0]

            // ===== IMAGE =====
            if (type === 'imageMessage') {
                const media = await quoted.download()
                const { cleanText: caption } = extractAndCleanMentions(
                    qMsg.imageMessage?.caption || rawText || '',
                    participants
                )
                return sock.sendMessage(m.chat, { image: media, caption, mentions })
            }

            // ===== VIDEO =====
            if (type === 'videoMessage') {
                const media = await quoted.download()
                const { cleanText: caption } = extractAndCleanMentions(
                    qMsg.videoMessage?.caption || rawText || '',
                    participants
                )
                return sock.sendMessage(m.chat, { video: media, caption, mentions })
            }

            // ===== STICKER =====
            if (type === 'stickerMessage') {
                const media = await quoted.download()
                await sock.sendMessage(m.chat, { sticker: media, mentions })
                if (text) await sock.sendMessage(m.chat, { text, mentions })
                return
            }

            // ===== AUDIO =====
            if (type === 'audioMessage') {
                const media = await quoted.download()
                const audioMsg = qMsg.audioMessage || {}
                await sock.sendMessage(m.chat, {
                    audio: media,
                    mimetype: audioMsg.mimetype,
                    ptt: audioMsg.ptt || false,
                    mentions
                })
                if (text) await sock.sendMessage(m.chat, { text, mentions })
                return
            }

            // ===== DOCUMENT =====
            if (type === 'documentMessage') {
                const media = await quoted.download()
                const docMsg = qMsg.documentMessage || {}
                await sock.sendMessage(m.chat, {
                    document: media,
                    mimetype: docMsg.mimetype,
                    fileName: docMsg.fileName || 'file',
                    mentions
                })
                if (text) await sock.sendMessage(m.chat, { text, mentions })
                return
            }

            // ===== TEXT / OTHER =====
            const quotedRaw =
                quoted.text ||
                qMsg.conversation ||
                qMsg.extendedTextMessage?.text ||
                ''

            const { cleanText: finalText } = extractAndCleanMentions(
                text || quotedRaw,
                participants
            )

            if (!finalText) return

            return sock.sendMessage(m.chat, { text: finalText, mentions })
        }

        // ===== NON-REPLY MODE =====
        await sock.sendMessage(m.chat, {
            text: text || '\u200B',
            mentions
        })

    } catch (err) {
        await m.reply(`❌ *ERROR*\n\n> ${err.message}`)
    }
}

module.exports = {
    config: pluginConfig,
    handler
}