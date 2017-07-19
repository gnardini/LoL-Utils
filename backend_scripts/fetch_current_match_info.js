require('dotenv').load()
const core = require('./core')
const rp = require('request-promise')

let config

function fetchCurrentMatchInfo(summonerId) {
  const options = {
    url: `${config.baseUrl}/lol/spectator/v3/active-games/by-summoner/${summonerId}`,
    headers: {
      'X-Riot-Token': config.riotApiKey,
    },
  }
  return rp(options).then(result => JSON.parse(result).participants)
}

function wrapParticipant(participant, masteryPoints) {
  return {
    summoner: participant.summonerName,
    championId: participant.championId,
    masteryPoints,
  }
}

function processParticipant(participant) {
  const options = {
    url: `${config.baseUrl}/lol/champion-mastery/v3/champion-masteries/by-summoner/${participant.summonerId}/by-champion/${participant.championId}`,
    headers: {
      'X-Riot-Token': config.riotApiKey,
    },
  }
  return rp(options)
    .then(result => wrapParticipant(participant, JSON.parse(result).championPoints))
    .catch(() => wrapParticipant(participant, -1))
}

function processParticipants(participants) {
  return Promise.all(participants.map(processParticipant))
}

exports.handler = (event, context, callback) => {
  config = {
    riotApiKey: process.env.RIOT_API_KEY,
    baseUrl: `https://${core.REGION_MAPPING[event.region]}.api.riotgames.com`,
  }
  core.getSummonerId(config, event.summonerName)
    .then(fetchCurrentMatchInfo)
    .then(processParticipants)
    .then(result => callback(null, result))
    .catch(callback)
}

exports.handler({
  summonerName: 'dyrus',
  region: 'na',
}, null, (err, result) => {
  console.log(`Error: ${err}`)
  console.log(`Result: ${JSON.stringify(result, null, 4)}`)
})
