import fs from 'fs'
import { orderBy } from 'lodash'

const layoutFilter = ['vanguard', 'token', 'plane', 'scheme', 'phenomenon']
const rarityFilter = ['Basic Land']
const flipLayouts = ['meld', 'double-faced']
const sides = ['front', 'back', 'meld']

export function getBlockData() {
  const data = JSON.parse(fs.readFileSync('./AllSets.json').toString())
  return Object.keys(data).reduce((foundCards, key) => {
    const { name, code, releaseDate } = data[key]
    return [...foundCards, { name, code, releaseDate }]
  }, [])
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
    return [frontside.multiverseid, backside.multiverseid, meldside.multiverseid]
  } else {
    return [frontside.multiverseid, backside.multiverseid]
  }
}

function populateMultiverseids(cards) {
  return cards.map(card => {
    if (!flipLayouts.includes(card.layout)) {
      return card
    }
    const multiverseids = getMultiverseids(cards, card)
    return { ...card, multiverseids, side: sides[multiverseids.indexOf(card.multiverseid)] }
  })
}

export function getCardData() {
  const data = JSON.parse(fs.readFileSync('./AllSets.json').toString())
  const cards = getCards(data).filter(card => !!card.multiverseid && !rarityFilter.includes(card.rarity) && !layoutFilter.includes(card.type.toLowerCase()))
  return orderBy(populateMultiverseids(cards), 'multiverseid', ['desc'])
}