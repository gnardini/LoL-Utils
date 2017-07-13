'use strict'

require('dotenv').load()
const fs = require('fs')
const core = require('./core')

let accountId

function findParticipantId(participants, playerAccountId) {
  const participant = participants.find(p => p.player.currentAccountId === playerAccountId)
  return participant.participantId
}

function getParticipantInfo(participants, participantId) {
  const participant = participants.find(p => p.participantId === participantId)
  return participant
}

function findEnemyChampion(participants, participantId, role) {
  return participants.find((participant) => {
    const enemyRole = `${participant.timeline.lane}-${participant.timeline.role}`
    return participant.participantId !== participantId && enemyRole === role
  })
}

function readSavedStats() {
  const filePath = `data/user/${accountId}/user_stats.json`
  core.mkdirp(filePath, '{}')
  const data = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(data)
}

function saveStats(stats) {
  fs.writeFileSync(`data/user/${accountId}/user_stats.json`, JSON.stringify(stats))
}

function saveMatchResult(usedChampion, enemyChampion, matchStats) {
  const stats = readSavedStats()
  if (!stats[usedChampion]) {
    stats[usedChampion] = {}
  }
  if (!stats[usedChampion][enemyChampion]) {
    stats[usedChampion][enemyChampion] = {
      games: 0,
      wins: 0,
      kills: 0,
      deaths: 0,
      assists: 0,
    }
  }
  stats[usedChampion][enemyChampion].games += 1
  stats[usedChampion][enemyChampion].kills += matchStats.kills
  stats[usedChampion][enemyChampion].deaths += matchStats.deaths
  stats[usedChampion][enemyChampion].assists += matchStats.assists
  if (matchStats.win) {
    stats[usedChampion][enemyChampion].wins += 1
  }
  saveStats(stats)
}

function processMatch(match) {
  if (!match) {
    return
  }
  const participantId = findParticipantId(match.participantIdentities, 237732)
  const participantInfo = getParticipantInfo(match.participants, participantId)
  const role = `${participantInfo.timeline.lane}-${participantInfo.timeline.role}`
  const enemy = findEnemyChampion(match.participants, participantId, role)
  if (!enemy) {
    return
  }
  const championUsed = participantInfo.championId
  const championsInfo = core.readChampionsInfo()
  saveMatchResult(championsInfo[championUsed], championsInfo[enemy.championId], participantInfo.stats)
}

function getMatchesInfo() {
  const data = fs.readFileSync(`data/user/${accountId}/matches_info.json`, 'utf8')
  return JSON.parse(data)
}

accountId = '237732'
fs.writeFileSync(`data/user/${accountId}/user_stats.json`, '{}')
const matches = getMatchesInfo()
for (const index in matches) {
  processMatch(matches[index])
}
const stats = readSavedStats()
const zyraStats = stats['Zyra']
const zyra = {}
for (const ch in zyraStats) {
  if (zyraStats[ch].games >= 3) zyra[ch] = zyraStats[ch]
}
console.log('Name      \tWinRate\tGames\tKDA')
for (const ch in zyra) {
  const v = zyra[ch]
  const championName = (ch + '               ').slice(0, 10)
  const wr = (v.wins/v.games).toFixed(3)
  const kda = ((v.kills+v.assists)/v.deaths).toFixed(3)
  console.log(`${championName}\t${wr}\t${v.games}\t${kda}`)
}
