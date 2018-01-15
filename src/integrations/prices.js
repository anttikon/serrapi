import fetch from 'node-fetch'
import { uniqBy, flatten, min } from 'lodash'

const flipLayouts = ['meld', 'double-faced', 'aftermath']

const ignoredBlocks = [
  'Oversized 6x9 Promos',
  'Collectors\' Edition',
  'International Edition'
]

export async function doFetch(cardName) {
  const priceApiUrl = process.env.PRICE_API
  if (!priceApiUrl) {
    return null
  }
  const cardNameFormatted = encodeURIComponent(cardName.replace(new RegExp(' ', 'g'), '_'))
  const body = await (await fetch(`${priceApiUrl}/products/${encodeURIComponent(cardNameFormatted)}`, { timeout: 5000 })).json()
  return body && body.product ? body : null
}

export function filterProducts(products, cardName, flipCard) {
  return products.filter(product => {
    const names = Object.keys(product.name).map(key => {
      // Accursed Witch / Infectious Curse vs Jace, Vryn's Prodigy // Jace, Telepath Unbound
      return flipCard ? product.name[key].productName.replace(new RegExp('//', 'g'), '/').split(' / ') : product.name[key].productName
    })
    return flatten(names).includes(cardName)
  }).filter(card => card.priceGuide.LOWEX !== 0).filter(card => !ignoredBlocks.includes(card.blockName))

}

function getCheapestBlocks(pricesByBlock, prop) {
  const prices = pricesByBlock.map(card => card[prop]).filter(price => !!price)
  const lowestPrice = min(prices)
  const cheapestBlocks = pricesByBlock.filter(card => card[prop] === lowestPrice).map(card => card.blockName)
  return { lowestPrice, cheapestBlocks }
}

export function populatePrices(cards, matchingProducts) {
  const pricesByBlock = matchingProducts.map(card => {
    return {
      blockName: card.expansion,
      priceLowEx: card.priceGuide.LOWEX,
      priceAvg: card.priceGuide.AVG,
      priceTrend: card.priceGuide.TREND
    }
  })

  const lowExPrices = getCheapestBlocks(pricesByBlock, 'priceLowEx')
  const avgPrices = getCheapestBlocks(pricesByBlock, 'priceAvg')
  const trendPrices = getCheapestBlocks(pricesByBlock, 'priceTrend')

  const prices = {
    lowExPrice: lowExPrices.lowestPrice,
    lowExBlocks: lowExPrices.cheapestBlocks,
    avgPrice: avgPrices.lowestPrice,
    avgBlocks: avgPrices.cheapestBlocks,
    trendPrice: trendPrices.lowestPrice,
    trendBlocks: trendPrices.cheapestBlocks
  }

  return cards.map(card => ({ ...card, prices }))
}

export function isFlipCard(card) {
  return flipLayouts.includes(card.layout)
}

export async function getPrices(cards) {
  const uniqueCards = uniqBy(cards, 'name')
  if (uniqueCards.length === 1) {
    const cardName = uniqueCards[0].name
    const flipCard = isFlipCard(uniqueCards[0])
    const results = await doFetch(cardName)
    if (!results) {
      return cards
    }
    const matchingProducts = filterProducts(results.product, cardName, flipCard)
    return populatePrices(cards, matchingProducts)
  }
  return cards
}
