import { orderBy, uniq, sortBy } from 'lodash'

const layoutFilter = ['vanguard', 'token', 'plane', 'scheme', 'phenomenon']
const typeFilter = ['Basic Land', 'Basic Land — Swamp', 'Basic Land — Mountain', 'Basic Land — Island', 'Basic Land — Plains', 'Basic Land — Forest']
const flipLayouts = ['meld', 'double-faced', 'transform']
const sides = ['front', 'back', 'meld']

export function getBlockData(data, cardData) {
  const blockData = Object.keys(data).reduce((foundCards, key) => {
    const { name, code, releaseDate } = data[key]
    return [...foundCards, { name, code, releaseDate }]
  }, [])

  const withoutEmptyBlocks = blockData.filter(block => cardData.find(card => card.block.code === block.code))
  return sortBy(withoutEmptyBlocks, 'name')
}

function getCards(data) {
  return Object.keys(data).reduce((foundCards, key) => {
    const populatedCards = data[key].cards.map(card => {
      card.block = {
        name: data[key].name,
        code: data[key].code,
        releaseDate: data[key].releaseDate
      }
      return card
    })
    return [...foundCards, ...populatedCards]
  }, [])
}

function getMultiverseids(cards, card) {
  const relatedCards = cards.filter(c => c.block.code === card.block.code && card.names.includes(c.name))

  const frontside = relatedCards.find(c => c.name === card.names[0])
  const backside = relatedCards.find(c => c.name === card.names[1])
  const meldside = relatedCards.find(c => c.name === card.names[2])

  if (card.names.length === 3) {
    return [frontside.multiverseId, backside.multiverseId, meldside.multiverseId]
  } else {
    return [frontside.multiverseId, backside.multiverseId]
  }
}

function populateMultiverseids(cards) {
  return cards.map(card => {
    if (!flipLayouts.includes(card.layout)) {
      return card
    }
    const multiverseids = getMultiverseids(cards, card)
    return { ...card, multiverseids, side: sides[multiverseids.indexOf(card.multiverseId)] }
  })
}

export function getCardData(data) {
  const cards = getCards(data).filter(card => !!card.multiverseId && !typeFilter.includes(card.type) && !layoutFilter.includes(card.layout.toLowerCase()))
  return orderBy(populateMultiverseids(cards), 'multiverseId', ['desc'])
}

export function getCardDataDetails(cardData) {
  return { cardDataLength: cardData.length, allCardNames: uniq(cardData.map(card => card.name)) }
}
