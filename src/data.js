import fs from 'fs'
import {orderBy} from 'lodash'

const layoutFilter = ['vanguard', 'token', 'plane', 'scheme', 'phenomenon']
const rarityFilter = ['Basic Land']

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

export function getCardData() {
  const data = JSON.parse(fs.readFileSync('./AllSets.json').toString())
  const cards = getCards(data).filter(card => !!card.multiverseid && !rarityFilter.includes(card.rarity) && !layoutFilter.includes(card.type.toLowerCase()))
  return orderBy(cards, 'multiverseid', ['desc'])
}
