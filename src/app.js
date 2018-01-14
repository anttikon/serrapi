import express from 'express'
import { getCardData, getBlockData } from './data'
import blocksRoute from './routes/blocks'
import cardsRoute from './routes/cards'

const data = {
  cardData: getCardData(),
  blockData: getBlockData()
}

const app = express()

blocksRoute(app, data)
cardsRoute(app, data)

app.listen(process.env.PORT || 3131)
