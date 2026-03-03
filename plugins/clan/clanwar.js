const { getDatabase } = require('../../src/lib/database')

const pluginConfig = {
    name: 'clanwar',
    alias: ['war', 'guildwar'],
    category: 'clan',
    description: 'War melawan clan lain',
    usage: '.clanwar <clan_id>',
    example: '.clanwar clan_123456',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3600,
    energi: 0,
    isEnabled: true
}

const BASE_BALANCE_WIN = 30000
const BASE_BALANCE_LOSE = 6000
const BASE_EXP_WIN = 15000
const BASE_EXP_LOSE = 3000
const BASE_LIMIT_WIN = 15
const BASE_LIMIT_LOSE = 3
const CLAN_EXP_WIN = 5000
const CLAN_EXP_LOSE = 1000

function calculatePower(db, clan) {
    let totalPower = 0
    for (const jid of clan.members) {
        const user = db.getUser(jid)
        const level = user?.rpg?.level || user?.level || 1
        const exp = user?.rpg?.exp || user?.exp || 0
        totalPower += (level * 100) + (exp / 10)
    }
    totalPower += (clan.level || 1) * 500
    totalPower += (clan.wins || 0) * 50
    return Math.floor(totalPower)
}

function calculateRewards(clan) {
    const level = clan.level || 1
    const multiplier = 1 + (level * 0.1)
    return {
        balanceWin: Math.floor(BASE_BALANCE_WIN * multiplier),
        balanceLose: Math.floor(BASE_BALANCE_LOSE * multiplier),
        expWin: Math.floor(BASE_EXP_WIN * multiplier),
        expLose: Math.floor(BASE_EXP_LOSE * multiplier),
        limitWin: Math.floor(BASE_LIMIT_WIN * multiplier),
        limitLose: Math.floor(BASE_LIMIT_LOSE * multiplier)
    }
}

function simulateWar(power1, power2) {
    const total = power1 + power2
    const chance1 = power1 / total
    const random = Math.random()
    const winner = random < chance1 ? 1 : 2
    return { winner }
}

async function handler(m) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    const targetClanId = m.text?.trim()
    
    if (!user?.clanId) {
        return m.reply(`❌ Kamu tidak punya clan!`)
    }
    
    if (!targetClanId) {
        return m.reply(`⚔️ *ᴄʟᴀɴ ᴡᴀʀ*\n\n> Masukkan ID clan lawan!\n\n> Contoh: .clanwar clan_123456\n> Cek ID di *.clanleaderboard*`)
    }
    
    if (!db.db.data.clans) db.db.data.clans = {}
    
    const myClan = db.db.data.clans[user.clanId]
    const enemyClan = db.db.data.clans[targetClanId]
    
    if (!myClan) return m.reply(`❌ Clan kamu tidak ditemukan!`)
    if (!enemyClan) return m.reply(`❌ Clan lawan tidak ditemukan!`)
    if (user.clanId === targetClanId) return m.reply(`❌ Tidak bisa war melawan clan sendiri!`)
    if (myClan.members.length < 3) return m.reply(`❌ Clan kamu butuh minimal 3 member!`)
    if (enemyClan.members.length < 3) return m.reply(`❌ Clan lawan butuh minimal 3 member!`)
    
    const myPower = calculatePower(db, myClan)
    const enemyPower = calculatePower(db, enemyClan)
    const result = simulateWar(myPower, enemyPower)
    const isWin = result.winner === 1
    
    const myRewards = calculateRewards(myClan)
    const enemyRewards = calculateRewards(enemyClan)
    
    if (isWin) {
        myClan.wins = (myClan.wins || 0) + 1
        myClan.exp = (myClan.exp || 0) + CLAN_EXP_WIN
        enemyClan.losses = (enemyClan.losses || 0) + 1
        enemyClan.exp = (enemyClan.exp || 0) + CLAN_EXP_LOSE
        
        for (const jid of myClan.members) {
            db.updateKoin(jid, myRewards.koinWin)
            db.updateExp(jid, myRewards.expWin)
            db.updateEnergi(jid, myRewards.limitWin)
        }
        for (const jid of enemyClan.members) {
            db.updateKoin(jid, enemyRewards.koinLose)
            db.updateExp(jid, enemyRewards.expLose)
            db.updateEnergi(jid, enemyRewards.limitLose)
        }
    } else {
        myClan.losses = (myClan.losses || 0) + 1
        myClan.exp = (myClan.exp || 0) + CLAN_EXP_LOSE
        enemyClan.wins = (enemyClan.wins || 0) + 1
        enemyClan.exp = (enemyClan.exp || 0) + CLAN_EXP_WIN
        
        for (const jid of myClan.members) {
            db.updateKoin(jid, myRewards.koinLose)
            db.updateExp(jid, myRewards.expLose)
            db.updateEnergi(jid, myRewards.limitLose)
        }
        for (const jid of enemyClan.members) {
            db.updateKoin(jid, enemyRewards.koinWin)
            db.updateExp(jid, enemyRewards.expWin)
            db.updateEnergi(jid, enemyRewards.limitWin)
        }
    }
    
    myClan.level = Math.floor(myClan.exp / 10000) + 1
    enemyClan.level = Math.floor(enemyClan.exp / 10000) + 1
    db.save()
    
    let txt = `⚔️ *ᴄʟᴀɴ ᴡᴀʀ ʀᴇsᴜʟᴛ*\n\n`
    txt += `╭┈┈⬡「 🏰 *${myClan.name}* 」\n`
    txt += `┃ 💪 Power: *${myPower.toLocaleString('id-ID')}*\n`
    txt += `┃ 🎖️ Level: *${myClan.level}*\n`
    txt += `┃ 👥 Members: *${myClan.members.length}*\n`
    txt += `├┈┈┈ ⚔️ VS ⚔️ ┈┈┈\n`
    txt += `┃ 🏰 *${enemyClan.name}*\n`
    txt += `┃ 💪 Power: *${enemyPower.toLocaleString('id-ID')}*\n`
    txt += `┃ 🎖️ Level: *${enemyClan.level}*\n`
    txt += `┃ 👥 Members: *${enemyClan.members.length}*\n`
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    
    if (isWin) {
        txt += `🎉 *${myClan.name} ᴍᴇɴᴀɴɢ!*\n\n`
        txt += `╭┈┈⬡「 🎁 *ʀᴇᴡᴀʀᴅ ᴘᴇʀ ᴍᴇᴍʙᴇʀ* 」\n`
        txt += `┃ 💰 +Rp ${myRewards.koinWin.toLocaleString('id-ID')}\n`
        txt += `┃ ✨ +${myRewards.expWin.toLocaleString('id-ID')} EXP\n`
        txt += `┃ 🎫 +${myRewards.limitWin} Limit\n`
        txt += `┃ 🚄 +${CLAN_EXP_WIN.toLocaleString('id-ID')} Clan EXP\n`
        txt += `╰┈┈┈┈┈┈┈┈⬡`
    } else {
        txt += `😢 *${enemyClan.name} ᴍᴇɴᴀɴɢ!*\n\n`
        txt += `╭┈┈⬡「 🎁 *ᴋᴏɴsᴏʟᴀsɪ ᴘᴇʀ ᴍᴇᴍʙᴇʀ* 」\n`
        txt += `┃ 💰 +Rp ${myRewards.koinLose.toLocaleString('id-ID')}\n`
        txt += `┃ ✨ +${myRewards.expLose.toLocaleString('id-ID')} EXP\n`
        txt += `┃ 🎫 +${myRewards.limitLose} Limit\n`
        txt += `┃ 🚄 +${CLAN_EXP_LOSE.toLocaleString('id-ID')} Clan EXP\n`
        txt += `╰┈┈┈┈┈┈┈┈⬡`
    }
    
    await m.reply(txt)
}

module.exports = {
    config: pluginConfig,
    handler
}

