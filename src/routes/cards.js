import { uniqBy, uniq } from 'lodash'
import { filterCards } from '../cardFilter'
import { getPrices } from '../integrations/prices'

export default (app, data) => {

  function parseQueryParams(req, param) {
    if (!req.query[param]) {
      return []
    }
    return Array.isArray(req.query[param]) ? req.query[param] : [req.query[param]]
  }

  app.get('/v1/cards', async (req, res) => {
    const blockQuery = parseQueryParams(req, 'b')
    const cardQuery = parseQueryParams(req, 'c')
    const prices = req.query.prices === 'true'
    const fuzzy = req.query.fuzzy === 'true'

    try {
      const cards = filterCards(data.cardData, { cardQuery, blockQuery, fuzzy })
      return prices ? res.json(await getPrices(cards)) : res.json(cards)
    } catch (e) {
      res.send(e)
    }
  })
}
