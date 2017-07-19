'use strict'

const fs = require('fs')
const core = require('../core')
const rp = require('request-promise')

class ChampionsStaticDataFetcher {

  constructor(config) {
    this.config = config
  }

  updateChampionsData() {
    return this.fetchChampionsData()
      .then(this.saveChampionsData)
  }

  fetchChampionsData() {
    const options = {
      url: `${core.baseUrl('na')}/lol/static-data/v3/champions`,
      headers: {
        'X-Riot-Token': this.config.riotApiKey,
      },
    }
    return rp(options).then(result => JSON.parse(result))
  }

  saveChampionsData(championsData) {
    return new Promise((resolve, reject) => {
      const processedData = {}
      for (const champName in championsData.data) {
        const champId = championsData.data[champName].id
        processedData[champId] = champName
      }
      const directory = 'data/champions_data.json'
      core.mkdirp(directory)
      fs.writeFile(directory, JSON.stringify(processedData), (err) => {
        if (err) reject()
        else resolve()
      })
    })
  }
}

module.exports = ChampionsStaticDataFetcher
