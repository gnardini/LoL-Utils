'use strict'

const ChampionsDataFetcher = require('../helper/champions_static_data_fetcher')

class StaticDataController {

  constructor(router, config) {
    this.router = router
    this.championsStaticDataFetcher = new ChampionsDataFetcher(config)
    this.registerRoutes()
  }

  registerRoutes() {
    this.router.get('/update_champions', this.updateChampions.bind(this))
  }

  updateChampions(req, res) {
    this.championsStaticDataFetcher
      .updateChampionsData()
      .then(() => res.sendStatus(204))
      .catch((err) => {
        res.status(500)
        const error = {
          error: JSON.stringify(err)
        }
        res.send(JSON.stringify(error))
      })
  }

}

module.exports = StaticDataController
