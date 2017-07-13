'use strict'

require('dotenv').load()
const fs = require('fs')
const core = require('./core')
const rp = require('request-promise')

let config

function getMatchHistory(accountId) {
  const options = {
    // queue 420 -> soloQ, 440 -> flexQ.
    url: `${config.baseUrl}/lol/match/v3/matchlists/by-account/${accountId}?season=9&queue=440&queue=420`,
    headers: {
      'X-Riot-Token': config.riotApiKey,
    },
  }
  return rp(options).then((result) => {
    console.log(JSON.parse(result).matches.length)
    const directory = `data/user/${accountId}/matchhistory.json`
    core.mkdirp(directory)
    fs.writeFile(directory, result, (err) => {
      if (err) {
        console.log(err)
      }
    })
  })
}

exports.handler = (event, context, callback) => {
  config = {
    riotApiKey: process.env.RIOT_API_KEY,
    baseUrl: `https://${core.REGION_MAPPING[event.region]}.api.riotgames.com`,
  }
  core.getSummonerId(config, event.summonerName)
    .then(getMatchHistory)
    .then(result => callback(null, result))
    .catch(callback)
}

exports.handler({
  summonerName: 'yakkult',
  region: 'las',
}, null, (err, result) => {
  console.log(`Error: ${err}`)
  console.log(`Result: ${JSON.stringify(result, null, 4)}`)
})
