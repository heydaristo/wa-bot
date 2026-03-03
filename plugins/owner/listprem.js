const pluginConfig = {
    name: 'listprem',
    alias: ['listpremium', 'premlist'],
    category: 'owner',
    description: 'Melihat daftar premium user',
    usage: '.listprem',
    example: '.listprem',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    try {
        const database = require('../../src/lib/database').getDatabase()

        if (!database.data.premium) database.data.premium = []

        // ✅ Auto-fix data lama format JID panjang → nomor saja
        database.data.premium = database.data.premium.map(p => {
            if (typeof p === 'object' && p.id) {
                p.id = p.id.split('@')[0].split(':')[0]
            } else if (typeof p === 'string') {
                p = p.split('@')[0].split(':')[0]
            }
            return p
        })
        database.save()

        const premiumUsers = database.data.premium

        if (premiumUsers.length === 0) {
            return m.reply(`💎 *ʟɪsᴛ ᴘʀᴇᴍɪᴜᴍ*\n\n> Tidak ada premium user yang terdaftar\n\n\`Gunakan: ${m.prefix}addprem <nomor>\``)
        }

        const isGroup = m.chat.endsWith('@g.us')
        const now = Date.now()

        let groupMembers = []
        if (isGroup) {
            try {
                const groupMeta = await sock.groupMetadata(m.chat)
                groupMembers = groupMeta.participants.map(p => p.id)
            } catch {}
        }

        let txt = `💎 *ʟɪsᴛ ᴘʀᴇᴍɪᴜᴍ*\n\n`
        txt += `╭┈┈⬡「 👑 *ᴜsᴇʀs* 」\n`
        const mentions = []

        for (let i = 0; i < premiumUsers.length; i++) {
            const p = premiumUsers[i]
            const raw = typeof p === 'object' ? (p.id || '') : p
            const number = raw.split('@')[0].split(':')[0]
            const jid = `${number}@s.whatsapp.net`
            const name = (typeof p === 'object' ? p.name : null) || 'Unknown'

            const expDate = typeof p === 'object' && p.expired
                ? new Date(p.expired).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                : 'Permanent'
            const remaining = typeof p === 'object' && p.expired
                ? Math.ceil((p.expired - now) / (1000 * 60 * 60 * 24))
                : '∞'

            const isInGroup = isGroup && groupMembers.includes(jid)

            if (isInGroup) {
                mentions.push(jid)
                txt += `┃ ${i + 1}. 👤 @${number}\n`
            } else {
                txt += `┃ ${i + 1}. 👤 *${name}*\n`
                txt += `┃    📱 \`${number}\`\n`
            }
            txt += `┃    📅 ${expDate} (${remaining} hari)\n`
        }

        txt += `╰┈┈⬡\n\n`
        txt += `> ᴛᴏᴛᴀʟ: \`${premiumUsers.length}\` ᴘʀᴇᴍɪᴜᴍ ᴜsᴇʀ`

        if (mentions.length > 0) {
            await sock.sendMessage(m.chat, { text: txt, mentions }, { quoted: m })
        } else {
            await m.reply(txt)
        }

    } catch (err) {
        console.error('[listprem] Error:', err)
        return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> ${err.message}`)
    }
}

module.exports = { config: pluginConfig, handler }