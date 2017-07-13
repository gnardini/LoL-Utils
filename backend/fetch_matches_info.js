'use strict'

require('dotenv').load()
const fs = require('fs')
const core = require('./core')
const rp = require('request-promise')

let config
let accountId

function fetchMatch(matchId) {
  const options = {
    url: `${config.baseUrl}/lol/match/v3/matches/${matchId}`,
    headers: {
      'X-Riot-Token': config.riotApiKey,
    },
  }
  return rp(options).then(result => JSON.parse(result))
}

function readTimestamp() {
  return fs.readFileSync(`data/user/${accountId}/timestamp`, 'utf8')
}

function writeTimestamp(timestamp) {
  fs.writeFile(`data/user/${accountId}/timestamp`, timestamp, (err) => {
    if (err) {
      console.log(err)
    }
  })
}

function readAllMatchesData() {
  const data = fs.readFileSync(`data/user/${accountId}/matches_info.json`, 'utf8')
  return JSON.parse(data)
}

function saveMatchInfo(matchInfo) {
  const info = readAllMatchesData(accountId)
  info.push(matchInfo)
  fs.writeFile(`data/user/${accountId}/matches_info.json`, JSON.stringify(info), (err) => {
    if (err) {
      console.log(err)
    }
  })
}

function processMatches(matches, index, finishedProcessing) {
  if (index < 0) {
    finishedProcessing()
    return
  }
  if (matches[index].platformId === 'NA1') {
    processMatches(matches, index - 1, finishedProcessing)
    return
  }
  fetchMatch(matches[index].gameId)
      .then((matchData) => {
        saveMatchInfo(matchData)
        writeTimestamp(matches[index].timestamp)
        console.log(`Processed ${index}`)
        processMatches(matches, index - 1, finishedProcessing)
      })
      .catch((err) => {
        console.log(err)
        setTimeout(() => {
          processMatches(matches, index, finishedProcessing)
        }, 5000)
      })
}

function processMatchesPromise(matches, index) {
  return new Promise(fulfill => processMatches(matches, index, fulfill))
}

function fetchUserMatchIds(accountId_) {
  accountId = accountId_
  return new Promise((fulfill, reject) => {
    const directory = `data/user/${accountId}/matchhistory.json`
    fs.readFile(directory, 'utf8', (err, res) => {
      if (err) reject(err)
      else fulfill(res)
    })
  })
}

function useMatchIds(matchIds) {
  const matchesData = JSON.parse(matchIds).matches
  const ts = readTimestamp()
  let index = matchesData.length - 1
  while (index >= 0 && matchesData[index].timestamp <= ts) index -= 1
  return processMatchesPromise(matchesData, index)
}

exports.handler = (event, context, callback) => {
  config = {
    riotApiKey: process.env.RIOT_API_KEY,
    baseUrl: `https://${core.REGION_MAPPING[event.region]}.api.riotgames.com`,
  }
  core.getSummonerId(config, event.summonerName)
    .then(fetchUserMatchIds)
    .then(useMatchIds)
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
