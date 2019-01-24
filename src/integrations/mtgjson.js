import fetch from 'node-fetch'
import { readFile } from 'fs'
import { promisify } from 'util'
import { getBlockData, getCardData, getCardDataDetails } from '../data'

const readFileAsync = promisify(readFile)

export function getMtgJson() {
  return fetch('https://mtgjson.com/json/AllSets.json').then(response => response.json())
}

export function getLocalMtgJson() {
  return readFileAsync(`${__dirname}/../../AllSets.json`).then(data => JSON.parse(data.toString()))
}

export async function getJsonData() {
  const getDataFunction = process.env.JSON_FILE === 'local' ? getLocalMtgJson : getMtgJson
  
  const json = await getDataFunction()
  const cardData = getCardData(json)
  const blockData = getBlockData(json, cardData)
  const filterData = getCardDataDetails(cardData)

  return {cardData, blockData, filterData}
}
