import express from 'express'
import cron from 'node-cron'
import { getJsonData } from './integrations/mtgjson'
import blocksRoute from './routes/blocks'
import cardsRoute from './routes/cards'

getJsonData().then(initialData => {

  const data = {
    cardData: initialData.cardData,
    blockData: initialData.blockData,
    filterData: initialData.filterData
  }

  cron.schedule('0 4 * * *', async () => {
    console.log('Reloading data')
    const reloadedData = await getJsonData()
    data.cardData = reloadedData.cardData
    data.blockData = reloadedData.blockData
    data.filterData = reloadedData.filterData
  })

  const app = express()

  blocksRoute(app, data)
  cardsRoute(app, data)

  const port = process.env.PORT || 3131
  console.log(`Listening: http://localhost:${port}/v1/cards?c=serra%20nglle&fuzzy=true`)
  app.listen(port)
})
