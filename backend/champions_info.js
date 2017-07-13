'use strict';

require('dotenv').load();
const fs = require('fs');
const core = require('./core');
const rp = require('request-promise');

let config;

function fetchChampionData() {
  const options = {
    url: `${config.baseUrl}/lol/static-data/v3/champions`,
    headers: {
      'X-Riot-Token': config.riotApiKey,
    },
  };
  return rp(options).then(result => JSON.parse(result));
}

function saveChampionData(championData) {
  const processedData = {};
  for (const champName in championData.data) {
    const champId = championData.data[champName].id;
    processedData[champId] = champName;
  }
  fs.writeFile('data/champions_data.json', JSON.stringify(processedData), (err) => {
    if (err) throw err;
  });
}

exports.handler = (event, context, callback) => {
  config = {
    riotApiKey: process.env.RIOT_API_KEY,
    baseUrl: `https://${core.REGION_MAPPING[event.region]}.api.riotgames.com`,
  };
  fetchChampionData()
      .then(saveChampionData);
};

exports.handler({
  summonerName: 'yakkult',
  region: 'las',
}, null, (err, result) => {
  console.log(`Error: ${err}`);
  console.log(`Result: ${JSON.stringify(result, null, 4)}`);
});
