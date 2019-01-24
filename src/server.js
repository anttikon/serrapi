import express from 'express'
import compression from 'compression'
import cron from 'node-cron'
import cors from 'cors'
import { getJsonData } from './integrations/mtgjson'
import blocksRoute from './routes/blocks'
import cardsRoute from './routes/cards'

export async function boot() {
  const initialData = await getJsonData()
  const data = {
    mtgjson: initialData.mtgjson,
    cardData: initialData.cardData,
    blockData: initialData.blockData,
    filterData: initialData.filterData
  }

  cron.schedule('0 4 * * *', async () => {
    console.log('Reloading data')
    const reloadedData = await getJsonData()
    data.mtgjson = reloadedData.mtgjson
    data.cardData = reloadedData.cardData
    data.blockData = reloadedData.blockData
    data.filterData = reloadedData.filterData
  })

  const app = express()
  app.use(compression())

  if (process.env.NODE_ENV !== 'production') {
    app.use(cors())
  }

  blocksRoute(app, data)
  cardsRoute(app, data)

  return app
}
