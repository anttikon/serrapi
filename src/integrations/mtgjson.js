import fetch from 'node-fetch'
import { createReadStream } from 'fs'
import { omit } from 'lodash'
import JSONStream from 'JSONStream'
import { getBlockData, getCardData, getCardDataDetails } from '../data'

const layoutFilter = ['vanguard', 'token', 'plane', 'scheme', 'phenomenon', 'planar']
const omitCardFields = ['starter', 'foreignData', 'printings', 'legalities', 'variations', 'uuid', 'tcgplayerProductId', 'tcgplayerPurchaseUrl', 'scryfallId', 'rulings', 'originalText', 'originalType', 'hasFoil', 'hasNonFoil', 'frameVersion', 'borderColor']
const omitBlockFields = ['tokens', 'boosterV3', 'baseSetSize', 'mtgoCode', 'meta', 'tcgplayerGroupId', 'totalSetSize']

function handleStream(readStream) {
  const parser = JSONStream.parse('*')
  readStream.pipe(parser)

  const data = {}
  return new Promise(resolve => {
    parser.on('data', (obj) => {
      obj.cards = obj.cards.map(card => omit(card, omitCardFields)).filter(card => !!card.multiverseId && !card.type.startsWith('Basic Land ') && !layoutFilter.includes(card.layout.toLowerCase()))
      data[obj.code] = omit(obj, omitBlockFields)
    })

    parser.on('close', () => {
      return resolve(data)
    })
  })
}

export function getMtgJson() {
  if (process.env.JSON_FILE === 'local') {
    const readStream = createReadStream(`${__dirname}/../../AllSets.json`)
    return handleStream(readStream)
  } else {
    return fetch('https://mtgjson.com/json/AllSets.json').then(response => handleStream(response.body))
  }
}

export async function getJsonData() {
  const mtgjson = await getMtgJson()
  const cardData = getCardData(mtgjson)
  const blockData = getBlockData(mtgjson, cardData)
  const filterData = getCardDataDetails(cardData)

  return {mtgjson, cardData, blockData, filterData}
}
