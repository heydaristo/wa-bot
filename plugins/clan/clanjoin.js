const { getDatabase } = require('../../src/lib/database')

const pluginConfig = {
    name: 'clanjoin',
    alias: ['joinclan', 'guildjoin'],
    category: 'clan',
    description: 'Gabung ke clan',
    usage: '.clanjoin <clan_id>',
    example: '.clanjoin clan_123456',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

const MAX_MEMBERS = 50

async function handler(m) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    const clanId = m.text?.trim()
    
    if (!clanId) {
        return m.reply(`🏰 *ᴄʟᴀɴ ᴊᴏɪɴ*\n\n> Masukkan ID clan!\n\n> Contoh: .clanjoin clan_123456\n> Cek ID di *.clanleaderboard*`)
    }
    
    if (user.clanId) {
        return m.reply(`❌ Kamu sudah punya clan!\n> Keluar dulu dengan *.clanleave*`)
    }
    
    if (!db.db.data.clans) db.db.data.clans = {}
    
    const clan = db.db.data.clans[clanId]
    if (!clan) return m.reply(`❌ Clan dengan ID tersebut tidak ditemukan!`)
    if (!clan.isOpen) return m.reply(`❌ Clan *${clan.name}* sedang tertutup!`)
    if (clan.members.length >= MAX_MEMBERS) return m.reply(`❌ Clan *${clan.name}* sudah penuh! (${MAX_MEMBERS}/50)`)
    
    clan.members.push(m.sender)
    db.setUser(m.sender, { clanId: clanId })
    db.save()
    
    let txt = `🏰 *ᴊᴏɪɴᴇᴅ ᴄʟᴀɴ!*\n\n`
    txt += `╭┈┈⬡「 📋 *ɪɴғᴏ* 」\n`
    txt += `┃ 🏰 Clan: *${clan.name}*\n`
    txt += `┃ 👑 Leader: @${clan.leader.split('@')[0]}\n`
    txt += `┃ 👥 Members: *${clan.members.length}/${MAX_MEMBERS}*\n`
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    txt += `> Ketik *.claninfo* untuk info clan`
    
    await m.reply(txt, { mentions: [clan.leader] })
}

module.exports = {
    config: pluginConfig,
    handler
}
