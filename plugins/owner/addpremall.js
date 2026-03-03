const config = require('../../config')
const { getDatabase } = require('../../src/lib/database')

const pluginConfig = {
    name: 'addpremall',
    alias: ['addpremiumall', 'setpremall'],
    category: 'owner',
    description: 'Menambahkan semua member grup ke premium',
    usage: '.addpremall',
    example: '.addpremall',
    isOwner: true,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    try {
        const groupMeta = await sock.groupMetadata(m.chat)
        const participants = groupMeta.participants || []

        if (participants.length === 0) {
            return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> Tidak ada member di grup ini`)
        }

        m.react('⏳')

        const db = getDatabase()
        if (!db.data.premium) db.data.premium = []

        let addedCount = 0
        let alreadyPremCount = 0
        const now = Date.now()
        const days = 30
        const premLimit = config.limits?.premium || 100

        for (const participant of participants) {
            // ✅ Pakai participant.jid yang berisi nomor WA asli
            const jid = participant.jid || participant.id || ''
            const number = jid.split('@')[0].split(':')[0]

            if (!number || number.includes('lid')) continue

            const existingIndex = db.data.premium.findIndex(p =>
                typeof p === 'object' ? p.id === number : p === number
            )

            if (existingIndex !== -1) {
                alreadyPremCount++
                continue
            }

            // Ambil nama
            let name = 'Unknown'
            try {
                const user = db.getUser(jid)
                if (user?.name && user.name !== number) name = user.name
            } catch {}
            if (name === 'Unknown' && participant.notify) name = participant.notify

            const newExpired = now + (days * 24 * 60 * 60 * 1000)
            db.data.premium.push({
                id: number,
                name: name,
                expired: newExpired,
                addedAt: now
            })

            const user = db.getUser(jid) || db.setUser(jid)
            user.energi = premLimit
            user.isPremium = true

            db.setUser(jid, user)
            db.updateExp(jid, 200000)
            db.updateKoin(jid, 20000)
            addedCount++
        }

        db.save()

        m.react('💎')
        await m.reply(
            `💎 *ᴀᴅᴅ ᴘʀᴇᴍɪᴜᴍ ᴀʟʟ*\n\n` +
            `╭┈┈⬡「 📋 *ʜᴀsɪʟ* 」\n` +
            `┃ 👥 ᴛᴏᴛᴀʟ ᴍᴇᴍʙᴇʀ: \`${participants.length}\`\n` +
            `┃ ✅ ᴅɪᴛᴀᴍʙᴀʜᴋᴀɴ: \`${addedCount}\`\n` +
            `┃ ⏭️ sᴜᴅᴀʜ ᴘʀᴇᴍɪᴜᴍ: \`${alreadyPremCount}\`\n` +
            `┃ 💎 ᴛᴏᴛᴀʟ ᴘʀᴇᴍɪᴜᴍ: \`${db.data.premium.length}\`\n` +
            `╰┈┈⬡\n\n` +
            `> Grup: ${groupMeta.subject}`
        )

    } catch (error) {
        m.react('❌')
        await m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> ${error.message}`)
    }
}

module.exports = { config: pluginConfig, handler }