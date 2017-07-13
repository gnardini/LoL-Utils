const rp = require('request-promise')
const fs = require('fs')
const path = require('path')

module.exports = {
  REGION_MAPPING: {
    na: 'na1',
    br: 'br1',
    eune: 'eun1',
    euw: 'euw1',
    jp: 'jp1',
    kr: 'kr',
    las: 'la2',
    lan: 'la1',
    oce: 'oc1',
    tr: 'tr1',
    ru: 'ru',
  },
  getSummonerId(config, summonerName) {
    const options = {
      url: `${config.baseUrl}/lol/summoner/v3/summoners/by-name/${summonerName}`,
      headers: {
        'X-Riot-Token': config.riotApiKey,
      },
    }
    return rp(options).then(result => JSON.parse(result).accountId)
  },
  readChampionsInfo() {
    const data = fs.readFileSync('data/champions_data.json', 'utf8')
    return JSON.parse(data)
  },
  mkdirp(filepath) {
    const dirname = path.dirname(filepath)
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname)
    }
  },
}
