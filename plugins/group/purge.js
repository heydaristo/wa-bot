/**
 * Plugin: Purge
 * Hapus pesan dari pesan yang di-reply hingga pesan terbaru (max 100)
 */

const pluginConfig = {
    name: ['purge'],
    category: 'group',
    description: 'Hapus pesan dari pesan yang di-reply sampai pesan terbaru (max 100)',
    usage: '.purge (reply pesan)',
    example: 'Reply pesan lalu ketik .purge',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
}

const MAX_DELETE = 100

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Convert Long object { low, high, unsigned } atau number biasa → number
 * Baileys kadang return protobuf Long untuk messageTimestamp
 */
function toLong(val) {
    if (!val) return 0
    if (typeof val === 'number') return val
    if (typeof val === 'bigint') return Number(val)
    // Protobuf Long object: { low, high, unsigned }
    if (typeof val === 'object' && 'low' in val) {
        const low = val.low >>> 0  // unsigned 32-bit
        const high = val.high >>> 0
        return high * 0x100000000 + low
    }
    return Number(val) || 0
}

async function handler(m, { sock }) {
    try {
        if (!m.quoted) {
            return m.reply(
                `╭┈┈⬡「 🗑️ *ᴘᴜʀɢᴇ* 」\n` +
                `┃ Reply pesan yang ingin dijadikan\n` +
                `┃ titik awal penghapusan, lalu ketik:\n` +
                `┃\n` +
                `┃ *${m.prefix}purge*\n` +
                `┃\n` +
                `┃ ⚠️ Semua pesan dari titik tersebut\n` +
                `┃ hingga terbaru akan dihapus (max ${MAX_DELETE})\n` +
                `╰┈┈┈┈┈┈┈┈⬡`
            )
        }

        // ── Baca timestamp dari store via stanzaId ─────────────────────
        let targetTimestamp = 0

        try {
            const stanzaId = m.quoted.stanzaId || m.quoted.key?.id || m.quoted.id
            if (stanzaId) {
                const fromStore = await sock.store?.loadMessage(m.chat, stanzaId)
                if (fromStore?.messageTimestamp) {
                    targetTimestamp = toLong(fromStore.messageTimestamp)
                }
            }
        } catch (_) {}

        // Fallback: scan chatStore array cari by key.id
        if (!targetTimestamp) {
            try {
                const keyId = m.quoted.key?.id || m.quoted.stanzaId || m.quoted.id
                const allMsgs = sock.store?.messages?.[m.chat]?.array || []
                const found = allMsgs.find(msg => msg?.key?.id === keyId)
                if (found?.messageTimestamp) {
                    targetTimestamp = toLong(found.messageTimestamp)
                }
            } catch (_) {}
        }

        // Last resort: timestamp command - 10 menit
        if (!targetTimestamp) {
            const cmdTs = toLong(m.messageTimestamp || m.t || 0)
            if (cmdTs > 0) targetTimestamp = cmdTs - (10 * 60)
        }

        if (!targetTimestamp || targetTimestamp <= 0) {
            return m.reply('❌ Gagal menentukan titik awal penghapusan.')
        }

        // Hapus pesan command
        try { await sock.sendMessage(m.chat, { delete: m.key }) } catch (_) {}

        const notif = await sock.sendMessage(m.chat, {
            text: `⏳ *Sedang mengumpulkan pesan...*`
        })

        // ── Ambil semua pesan dari store sejak targetTimestamp ──────────
        let toDelete = []

        try {
            const allMsgs = sock.store?.messages?.[m.chat]?.array || []
            toDelete = allMsgs
                .filter(msg => {
                    if (!msg?.key) return false
                    if (msg.key.id === notif?.key?.id) return false
                    if (msg.key.id === m.key?.id) return false
                    const ts = toLong(msg.messageTimestamp)
                    return ts >= targetTimestamp
                })
                .sort((a, b) => toLong(a.messageTimestamp) - toLong(b.messageTimestamp))
                .slice(0, MAX_DELETE)
        } catch (_) {}

        // Fallback: hapus quoted saja
        if (toDelete.length === 0) {
            try { await sock.sendMessage(m.chat, { delete: m.quoted.key }) } catch (_) {}
            try { await sock.sendMessage(m.chat, { delete: notif.key }) } catch (_) {}
            return sock.sendMessage(m.chat, {
                text:
                    `╭┈┈⬡「 🗑️ *ᴘᴜʀɢᴇ* 」\n` +
                    `┃ ✅ Berhasil: *1* pesan\n` +
                    `┃ ⚠️ Cache terbatas\n` +
                    `┃ 👤 Oleh: @${m.sender.split('@')[0]}\n` +
                    `╰┈┈┈┈┈┈┈┈⬡`,
                mentions: [m.sender]
            })
        }

        try {
            await sock.sendMessage(m.chat, {
                text: `⏳ *Menghapus ${toDelete.length} pesan...*`,
                edit: notif.key
            })
        } catch (_) {}

        let deleted = 0, failed = 0

        for (const msg of toDelete) {
            try {
                await sock.sendMessage(m.chat, { delete: msg.key })
                deleted++
                await delay(300)
            } catch (_) { failed++ }
        }

        try { await sock.sendMessage(m.chat, { delete: notif.key }) } catch (_) {}

        await sock.sendMessage(m.chat, {
            text:
                `╭┈┈⬡「 🗑️ *ᴘᴜʀɢᴇ* 」\n` +
                `┃ ✅ Berhasil: *${deleted}* pesan\n` +
                (failed > 0 ? `┃ ❌ Gagal: *${failed}* pesan\n` : '') +
                `┃ 👤 Oleh: @${m.sender.split('@')[0]}\n` +
                `╰┈┈┈┈┈┈┈┈⬡`,
            mentions: [m.sender]
        })

    } catch (err) {
        await m.reply(`❌ *ERROR PURGE*\n\n> ${err.message}`)
    }
}

module.exports = {
    config: pluginConfig,
    handler
}