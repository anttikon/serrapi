import fetch from 'node-fetch'
import { createReadStream } from 'fs'
import { omit } from 'lodash'
import JSONStream from 'JSONStream'
import { getBlockData, getCardData, getCardDataDetails } from '../data'

const omitCardFields = ['foreignData', 'printings', 'legalities', 'variations', 'uuid', 'tcgplayerProductId', 'tcgplayerPurchaseUrl', 'scryfallId', 'rulings']

function handleStream(readStream) {
  const parser = JSONStream.parse('*')
  readStream.pipe(parser)

  const data = {}
  return new Promise(resolve => {
    parser.on('data', (obj) => {
      obj.cards = obj.cards.map(card => omit(card, omitCardFields))
      data[obj.code] = omit(obj, ['tokens', 'boosterV3', 'baseSetSize', 'mtgoCode', 'meta', 'tcgplayerGroupId', 'totalSetSize'])
    })

    parser.on('close', () => {
      return resolve(data)
    })
  })
}

export function getMtgJson() {
  return fetch('https://mtgjson.com/json/AllSets.json').then(response => handleStream(response.body))
}

export function getLocalMtgJson() {
  const readStream = createReadStream(`${__dirname}/../../AllSets.json`)
  return handleStream(readStream)
}

export async function getJsonData() {
  const getDataFunction = process.env.JSON_FILE === 'local' ? getLocalMtgJson : getMtgJson
  
  const json = await getDataFunction()
  const cardData = getCardData(json)
  const blockData = getBlockData(json, cardData)
  const filterData = getCardDataDetails(cardData)

  return {cardData, blockData, filterData}
}
