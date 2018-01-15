import leven from 'leven'
import { uniq, uniqBy } from 'lodash'

import { getCardData } from './data'
const { cardDataLength, allCardNames } = getCardDataDetails()

const replaceAll = (str, find, replace) => str.replace(new RegExp(find, 'g'), replace)
const querify = (str) => new RegExp(`^${replaceAll(str, /\*/, '.*')}$`, 'i')

function getCardDataDetails() {
  const cardData = getCardData()
  return { cardDataLength: cardData.length, allCardNames: uniq(cardData.map(card => card.name)) }
}

function filterByBlock(cards, blockCodes) {
  if (blockCodes.length === 0) {
    return cards
  }
  return cards.filter(card => blockCodes.find(blockCode => card.block.code.match(querify(blockCode))))
}

function filterByName(cardData, cardNames, fuzzy) {
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

  return fuzzy ? [...cards, ...fuzzySearch(cardData, missedQueries)] : cards
}

export function fuzzySearch(cards, searchTerms) {
  if (searchTerms.length === 0) {
    return []
  }

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

export function filterCards(cardData, { cardQuery, blockQuery, fuzzy }) {
  if (cardQuery.length === 0 && blockQuery.length === 0) {
    return cardData
  }
  const byBlock = filterByBlock(cardData, blockQuery)
  const byName = filterByName(byBlock, cardQuery, fuzzy)
  return uniqBy(byName, 'multiverseid')
}
