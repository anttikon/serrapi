import fuzz from 'fuzzball'
import { uniq, uniqBy } from 'lodash'

const replaceAll = (str, find, replace) => str.replace(new RegExp(find, 'g'), replace)
const querify = (str) => new RegExp(`^${replaceAll(str, /\*/, '.*')}$`, 'i')

function filterByBlock(cards, blockCodes) {
  if (blockCodes.length === 0) {
    return cards
  }
  return cards.filter(card => blockCodes.find(blockCode => card.block.code.match(querify(blockCode))))
}

function filterByName(cardData, cardNames, fuzzy) {
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

  const cardNames = uniq(cards.map(card => card.name))

  return searchTerms.reduce((foundCards, query) => {
    const fuzzySearchCardName = fuzz.extract(query, cardNames, { scorer: fuzz.ratio, wildcards: '*' })[0][0]
    if (!fuzzySearchCardName) {
      return foundCards
    }
    const results = cards.filter(card => card.name.match(new RegExp(`^${fuzzySearchCardName}$`, 'i')))
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
