const { getDatabase } = require('../../src/lib/database')
const { getRpgContextInfo } = require('../../src/lib/contextHelper')

const pluginConfig = {
    name: 'transfer',
    alias: ['tf', 'kirim'],
    category: 'rpg',
    description: 'Transfer uang atau item ke user lain',
    usage: '.transfer <money/nama_item> <jumlah> @user',
    example: '.transfer money 10000 @tag',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const sender = db.getUser(m.sender)
    
    const args = m.args || []
    if (args.length < 3) {
        return m.reply(
            `💸 *ᴛʀᴀɴsꜰᴇʀ*\n\n` +
            `╭┈┈⬡「 📋 *ᴜsᴀɢᴇ* 」\n` +
            `┃ > \`.transfer money 10000 @user\`\n` +
            `┃ > \`.transfer potion 5 @user\`\n` +
            `╰┈┈┈┈┈┈┈┈⬡`
        )
    }
    
    const type = args[0].toLowerCase()
    const amount = parseInt(args[1])
    const target = m.mentionedJid?.[0] || m.quoted?.sender
    
    if (!target) {
        return m.reply(`❌ *ᴛᴀʀɢᴇᴛ ɴᴏᴛ ꜰᴏᴜɴᴅ*\n\n> Tag user tujuan!`)
    }
    
    if (target === m.sender) {
        return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> Tidak bisa transfer ke diri sendiri!`)
    }
    
    if (!amount || amount <= 0) {
        return m.reply(`❌ *ɪɴᴠᴀʟɪᴅ ᴀᴍᴏᴜɴᴛ*\n\n> Jumlah harus lebih dari 0!`)
    }
    
    const recipient = db.getUser(target) || db.setUser(target)
    
    if (type === 'money' || type === 'balance') {
        if ((sender.koin || 0) < amount) {
            return m.reply(
                `❌ *sᴀʟᴅᴏ ᴛɪᴅᴀᴋ ᴄᴜᴋᴜᴘ*\n\n` +
                `> Koin kamu: Rp ${(sender.koin || 0).toLocaleString('id-ID')}\n` +
                `> Butuh: Rp ${amount.toLocaleString('id-ID')}`
            )
        }
        
        sender.koin -= amount
        recipient.koin = (recipient.koin || 0) + amount
        
        db.setUser(m.sender, sender)
        db.setUser(target, recipient)
        db.save()
        return m.reply(`✅ *ᴛʀᴀɴsꜰᴇʀ sᴜᴋsᴇs*\n\n> 💸 Dikirim: Rp ${amount.toLocaleString('id-ID')}\n> 👤 Penerima: @${target.split('@')[0]}`, { mentions: [target] })
    } else {
        sender.inventory = sender.inventory || {}
        recipient.inventory = recipient.inventory || {}
        
        if ((sender.inventory[type] || 0) < amount) {
            return m.reply(
                `❌ *ɪᴛᴇᴍ ᴛɪᴅᴀᴋ ᴄᴜᴋᴜᴘ*\n\n` +
                `> Item *${type}* kamu: ${sender.inventory[type] || 0}\n` +
                `> Butuh: ${amount}`
            )
        }
        
        sender.inventory[type] -= amount
        recipient.inventory[type] = (recipient.inventory[type] || 0) + amount
        
        db.setUser(m.sender, sender)
        db.setUser(target, recipient)
        db.save()
        return m.reply(`✅ *ᴛʀᴀɴsꜰᴇʀ sᴜᴋsᴇs*\n\n> 📦 Item: ${type}\n> 🔢 Jumlah: ${amount}\n> 👤 Penerima: @${target.split('@')[0]}`, { mentions: [target] })
    }
}

module.exports = {
    config: pluginConfig,
    handler
}
