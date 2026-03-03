const config = require('../../config')
const { getDatabase } = require('../../src/lib/database')
const { addJadibotPremium, removeJadibotPremium, getJadibotPremiums } = require('../../src/lib/jadibotDatabase')

const pluginConfig = {
    name: 'addprem',
    alias: ['addpremium', 'setprem', 'delprem', 'delpremium', 'listprem', 'premlist'],
    category: 'owner',
    description: 'Kelola premium users',
    usage: '.addprem <nomor/@tag>',
    example: '.addprem 6281234567890',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock, jadibotId, isJadibot }) {
    const db = getDatabase()
    const cmd = m.command.toLowerCase()

    const isAdd = ['addprem', 'addpremium', 'setprem'].includes(cmd)
    const isDel = ['delprem', 'delpremium'].includes(cmd)
    const isList = ['listprem', 'premlist'].includes(cmd)

    if (!db.data.premium) db.data.premium = []

    // ─── LIST ────────────────────────────────────────────────────────────────
    if (isList) {
        if (isJadibot && jadibotId) {
            const jbPremiums = getJadibotPremiums(jadibotId)
            if (jbPremiums.length === 0) {
                return m.reply(`💎 *ᴅᴀꜰᴛᴀʀ ᴘʀᴇᴍɪᴜᴍ ᴊᴀᴅɪʙᴏᴛ*\n\n> Belum ada premium terdaftar.\n> Gunakan \`${m.prefix}addprem\` untuk menambah.`)
            }
            let txt = `💎 *ᴅᴀꜰᴛᴀʀ ᴘʀᴇᴍɪᴜᴍ ᴊᴀᴅɪʙᴏᴛ*\n\n`
            txt += `> Bot: *${jadibotId}*\n`
            txt += `> Total: *${jbPremiums.length}* premium\n\n`
            jbPremiums.forEach((p, i) => {
                const num = typeof p === 'string' ? p : p.jid
                txt += `${i + 1}. 💎 \`${num}\`\n`
            })
            return m.reply(txt)
        }

        if (db.data.premium.length === 0) {
            return m.reply(`💎 *ᴅᴀꜰᴛᴀʀ ᴘʀᴇᴍɪᴜᴍ*\n\n> Belum ada premium terdaftar.`)
        }

        const now = Date.now()
        const isGroup = m.chat.endsWith('@g.us')

        // Ambil member group jika di group
        let groupMembers = []
        if (isGroup) {
            try {
                const groupMeta = await sock.groupMetadata(m.chat)
                // ✅ Pakai participant.jid bukan participant.id
                groupMembers = groupMeta.participants.map(p => p.jid || p.id)
            } catch {}
        }

        let txt = `💎 *ᴅᴀꜰᴛᴀʀ ᴘʀᴇᴍɪᴜᴍ*\n\n`
        txt += `╭┈┈⬡「 👑 *ᴜsᴇʀs* 」\n`
        txt += `┃ Total: *${db.data.premium.length}* premium\n┃\n`

        const mentions = []

        db.data.premium.forEach((p, i) => {
            // ✅ Fix: definisikan raw dengan benar
            const raw = typeof p === 'string' ? p : (p.id || '')
            const number = raw.split('@')[0].split(':')[0]
            const jid = `${number}@s.whatsapp.net`

            // Ambil nama: prioritas dari db.getUser → p.name → 'Unknown'
            let name = 'Unknown'
            try {
                const user = db.getUser(jid)
                if (user?.name && user.name !== number) name = user.name
            } catch {}
            if (name === 'Unknown' && typeof p === 'object' && p.name) name = p.name

            const expDate = typeof p === 'object' && p.expired
                ? new Date(p.expired).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                : 'Permanent'
            const remaining = typeof p === 'object' && p.expired
                ? Math.ceil((p.expired - now) / (1000 * 60 * 60 * 24))
                : '∞'

            const isInGroup = isGroup && groupMembers.includes(jid)

            if (isInGroup) {
                mentions.push(jid)
                txt += `┃ ${i + 1}. 💎 @${number}\n`
            } else {
                txt += `┃ ${i + 1}. 💎 *${name}*\n`
                txt += `┃    📱 \`${number}\`\n`
            }
            txt += `┃    📅 ${expDate} (${remaining} hari)\n`
        })

        txt += `╰┈┈⬡`

        if (mentions.length > 0) {
            return sock.sendMessage(m.chat, { text: txt, mentions }, { quoted: m })
        } else {
            return m.reply(txt)
        }
    }

    // ─── TARGET NUMBER ───────────────────────────────────────────────────────
    let targetNumber = ''
    let targetName = 'Unknown'

    if (m.quoted) {
        // ✅ Pakai split('@')[0] bukan regex angka
        targetNumber = m.quoted.sender?.split('@')[0].split(':')[0] || ''
        targetName = m.quoted.pushName || 'Unknown'
        const qJid = `${targetNumber}@s.whatsapp.net`
        try {
            const user = db.getUser(qJid)
            if (user?.name && user.name !== targetNumber) targetName = user.name
        } catch {}
    } else if (m.mentionedJid?.length) {
        const mentionJid = m.mentionedJid[0]
        targetNumber = mentionJid.split('@')[0].split(':')[0]
        try {
            const user = db.getUser(mentionJid)
            if (user?.name && user.name !== targetNumber) targetName = user.name
        } catch {}
        if (targetName === 'Unknown' && m.chat.endsWith('@g.us')) {
            try {
                const groupMeta = await sock.groupMetadata(m.chat)
                const participant = groupMeta.participants.find(p =>
                    (p.jid || p.id) === mentionJid
                )
                if (participant?.notify) targetName = participant.notify
            } catch {}
        }
    } else if (m.args[0]) {
        targetNumber = m.args[0].replace(/[^0-9]/g, '')
    }

    if (!targetNumber) {
        return m.reply(`💎 *${isAdd ? 'ADD' : 'DEL'} ᴘʀᴇᴍɪᴜᴍ*\n\n> Masukkan nomor atau tag user\n\n\`Contoh: ${m.prefix}${cmd} 6281234567890\``)
    }

    if (targetNumber.startsWith('0')) {
        targetNumber = '62' + targetNumber.slice(1)
    }

    if (targetNumber.length < 10 || targetNumber.length > 15) {
        return m.reply(`❌ Format nomor tidak valid`)
    }

    // ─── JADIBOT ─────────────────────────────────────────────────────────────
    if (isJadibot && jadibotId) {
        if (isAdd) {
            if (addJadibotPremium(jadibotId, targetNumber)) {
                m.react('💎')
                return m.reply(
                    `💎 *ᴘʀᴇᴍɪᴜᴍ ᴊᴀᴅɪʙᴏᴛ ᴅɪᴛᴀᴍʙᴀʜᴋᴀɴ*\n\n` +
                    `> Bot: \`${jadibotId}\`\n` +
                    `> Nomor: \`${targetNumber}\`\n` +
                    `> Total: *${getJadibotPremiums(jadibotId).length}* premium`
                )
            } else {
                return m.reply(`❌ \`${targetNumber}\` sudah premium di Jadibot ini.`)
            }
        } else if (isDel) {
            if (removeJadibotPremium(jadibotId, targetNumber)) {
                m.react('✅')
                return m.reply(
                    `✅ *ᴘʀᴇᴍɪᴜᴍ ᴊᴀᴅɪʙᴏᴛ ᴅɪʜᴀᴘᴜs*\n\n` +
                    `> Bot: \`${jadibotId}\`\n` +
                    `> Nomor: \`${targetNumber}\`\n` +
                    `> Total: *${getJadibotPremiums(jadibotId).length}* premium`
                )
            } else {
                return m.reply(`❌ \`${targetNumber}\` bukan premium di Jadibot ini.`)
            }
        }
        return
    }

    // ─── ADD ──────────────────────────────────────────────────────────────────
    if (isAdd) {
        const existingIndex = db.data.premium.findIndex(p =>
            typeof p === 'string' ? p === targetNumber : p.id === targetNumber
        )

        const days = parseInt(m.args?.find(a => /^\d+$/.test(a) && a.length <= 4)) || 30
        const now = Date.now()

        let newExpired
        let message = ''

        if (existingIndex !== -1) {
            const currentData = db.data.premium[existingIndex]
            const currentExpired = typeof currentData === 'string' ? now : (currentData.expired || now)
            const baseTime = currentExpired > now ? currentExpired : now
            newExpired = baseTime + (days * 24 * 60 * 60 * 1000)

            if (typeof currentData === 'string') {
                db.data.premium[existingIndex] = {
                    id: targetNumber,
                    name: targetName,
                    expired: newExpired,
                    addedAt: now
                }
            } else {
                db.data.premium[existingIndex].expired = newExpired
                db.data.premium[existingIndex].name = targetName
            }
            message = `Premium diperpanjang`
        } else {
            newExpired = now + (days * 24 * 60 * 60 * 1000)
            db.data.premium.push({
                id: targetNumber,
                name: targetName,
                expired: newExpired,
                addedAt: now
            })
            message = `Berhasil ditambahkan`
        }

        const jid = `${targetNumber}@s.whatsapp.net`
        const premLimit = config.limits?.premium || 100
        const user = db.getUser(jid) || db.setUser(jid)

        user.energi = premLimit
        user.isPremium = true

        db.setUser(jid, user)
        db.updateExp(jid, 200000)
        db.updateKoin(jid, 20000)
        db.save()

        const expDate = new Date(newExpired).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
        })

        m.react('💎')
        return m.reply(
            `💎 *ᴘʀᴇᴍɪᴜᴍ ᴅɪᴛᴀᴍʙᴀʜᴋᴀɴ*\n\n` +
            `> Nama: *${targetName}*\n` +
            `> Nomor: \`${targetNumber}\`\n` +
            `> Durasi: *${days} hari*\n` +
            `> Expired: *${expDate}*\n` +
            `> ${message}\n\n` +
            `🎁 *ʙᴏɴᴜs:*\n` +
            `> ⚡ Energi: *${premLimit}*\n` +
            `> 🆙 Exp: *+200.000*\n` +
            `> 💰 Koin: *+20.000*`
        )

    // ─── DEL ──────────────────────────────────────────────────────────────────
    } else if (isDel) {
        const index = db.data.premium.findIndex(p =>
            typeof p === 'string' ? p === targetNumber : p.id === targetNumber
        )

        if (index === -1) {
            return m.reply(`❌ \`${targetNumber}\` bukan premium`)
        }

        db.data.premium.splice(index, 1)

        const jid = `${targetNumber}@s.whatsapp.net`
        const user = db.getUser(jid)
        if (user) {
            user.isPremium = false
            db.setUser(jid, user)
        }

        db.save()

        m.react('✅')
        return m.reply(
            `✅ *ᴘʀᴇᴍɪᴜᴍ ᴅɪʜᴀᴘᴜs*\n\n` +
            `> Nomor: \`${targetNumber}\`\n` +
            `> Total: *${db.data.premium.length}* premium`
        )
    }
}

module.exports = {
    config: pluginConfig,
    handler
}