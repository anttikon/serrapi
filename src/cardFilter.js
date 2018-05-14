import leven from 'leven'
import { uniq, uniqBy } from 'lodash'

const replaceAll = (str, find, replace) => str.replace(new RegExp(find, 'g'), replace)
const querify = (str) => new RegExp(`^${replaceAll(str, /\*/, '.*')}$`, 'i')

function filterByBlock(cards, blockCodes) {
  if (blockCodes.length === 0) {
    return cards
  }
  return cards.filter(card => blockCodes.find(blockCode => card.block.code.match(querify(blockCode))))
}

function filterByMultiverseId(cards, multiverseIds) {
  if (multiverseIds.length === 0) {
    return cards
  }
  return cards.filter(card => multiverseIds.find(multiverseId => {
    const intMultiverseId = parseInt(multiverseId)
    return card.multiverseids ? card.multiverseids.includes(intMultiverseId) : card.multiverseid === intMultiverseId
  }))
}

function filterByName(cardData, cardNames, fuzzy, filterData) {
  if (cardNames.length === 0) {
    return cardData
  }

  const { cards, missedQueries } = cardNames.reduce((result, cardName) => {
    const results = cardData.filter(card => card.name.match(querify(cardName)))
    if (results.length > 0) {
      return { ...result, cards: [...result.cards, ...results] }
    } else {
      return { ...result, missedQueries: [...result.missedQueries, cardName] }
    }
  }, { cards: [], missedQueries: [] })

  return fuzzy ? [...cards, ...fuzzySearch(cardData, missedQueries, filterData)] : cards
}

export function fuzzySearch(cards, searchTerms, filterData) {
  if (searchTerms.length === 0) {
    return []
  }

  const { cardDataLength, allCardNames } = filterData
  const cardNames = cards.length === cardDataLength ? allCardNames : uniq(cards.map(card => card.name))

  return searchTerms.reduce((foundCards, query) => {
    const match = cardNames.reduce((best, name) => {
      const distance = leven(query, name)
      if (!best.name && !best.distance) {
        return { name, distance }
      } else if (distance < best.distance) {
        return { name, distance }
      }
      return best

    }, { name: null, distance: null })

    const results = cards.filter(card => card.name === match.name)
    return [...foundCards, ...results]
  }, [])
}

export function filterCards(filterData, cardData, { cardQuery, multiverseIdQuery, blockQuery, fuzzy }) {
  if (cardQuery.length === 0 && blockQuery.length === 0 && multiverseIdQuery.length === 0) {
    return cardData
  }
  const byMultiverseId = filterByMultiverseId(cardData, multiverseIdQuery)
  const byBlock = filterByBlock(byMultiverseId, blockQuery)
  const byName = filterByName(byBlock, cardQuery, fuzzy, filterData)
  return uniqBy(byName, 'multiverseid')
}
