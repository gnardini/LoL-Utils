const rp = require('request-promise');

const RIOT_API_KEY = '';
const REGION_MAPPING = {
  las: 'la2',
  na: 'na1',
  br: 'br1',
  eune: 'eun1',
  euw: 'euw1',
  jp: 'jp1',
  kr: 'kr',
  lan: 'la1',
  oce: 'oc1',
  tr: 'tr1',
  ru: 'ru',
};
let baseUrl;

function getSummonerId(summonerName) {
  const options = {
    url: `${baseUrl}/lol/summoner/v3/summoners/by-name/${summonerName}`,
    headers: {
      'X-Riot-Token': RIOT_API_KEY,
    },
  };
  return rp(options).then(result => JSON.parse(result).id);
}

function fetchCurrentMatchInfo(summonerId) {
  const options = {
    url: `${baseUrl}/lol/spectator/v3/active-games/by-summoner/${summonerId}`,
    headers: {
      'X-Riot-Token': RIOT_API_KEY,
    },
  };
  return rp(options).then(result => JSON.parse(result).participants);
}

function wrapParticipant(participant, masteryPoints) {
  return {
    summoner: participant.summonerName,
    championId: participant.championId,
    masteryPoints,
  };
}

function processParticipant(participant) {
  const options = {
    url: `${baseUrl}/lol/champion-mastery/v3/champion-masteries/by-summoner/${participant.summonerId}/by-champion/${participant.championId}`,
    headers: {
      'X-Riot-Token': RIOT_API_KEY,
    },
  };
  return rp(options)
    .then(result => wrapParticipant(participant, JSON.parse(result).championPoints))
    .catch(() => wrapParticipant(participant, -1));
}

function processParticipants(participants) {
  return Promise.all(participants.map(processParticipant));
}

exports.handler = (event, context, callback) => {
  baseUrl = `https://${REGION_MAPPING[event.region]}.api.riotgames.com`;
  getSummonerId(event.summonerName)
    .then(fetchCurrentMatchInfo)
    .then(processParticipants)
    .then(result => callback(null, result))
    .catch(callback);
};

exports.handler({
  summonerName: 'dyrus',
  region: 'na',
}, null, (err, result) => {
  console.log(`Error: ${err}`);
  console.log(`Result: ${JSON.stringify(result, null, 4)}`);
});
