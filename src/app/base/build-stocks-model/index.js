/*
 * @Author: Rongxis 
 * @Date: 2019-07-25 14:23:25 
 * @Last Modified by: Rongxis
 * @Last Modified time: 2019-08-17 10:43:26
 */
import fs from 'fs'
import path from 'path'
import puppeteer from 'puppeteer'
import { getAllStocks } from './build-model'
const { readFile, writeFile } = require(`${global.srcRoot}/utils`)
const baseDataPath = `${global.srcRoot}/db/warehouse`
const fileName = 'base.json'
export function buildStocksModel() {
  return new Promise(async (s, j) => {
    const alreadyData = await tryToloadAlreadyData(path.join(baseDataPath, fileName))
    if (alreadyData) return s('success')
    try {
      const browser = await puppeteer.launch().catch()
      const page = await browser.newPage().catch()
      const allStocks = await getAllStocks(page)
      writeFile(path.join(baseDataPath, fileName), {
        date: new Date().getTime(),
        data: JSON.stringify(allStocks)
      })
      return s('success')
    } catch (error) {
      return j(error)
    }
  }).catch(function(error) {
    console.error(error)
  })
}

function goToken(url) {
  try {
    if (!global.external.token) {
      var matchs = url.match(/[\?|\&]token\=[\d\w]+/ig)
      if (matchs.length) {
        global.external.token = matchs[0].split('=')[1]
      }
    }
  } catch (error) {
    console.log('./src/app/process/phantomjs/sniff_home_page.js:87 ', error)
    // phantom.exit()
  }
}

function tryToloadAlreadyData(filePath) {
  let data = readFile(filePath, 'utf8')
  if (!data) return ''
  if (Number.parseInt(data.date) - new Date().getTime() >= 24 * 60 * 60 * 1000) {
    return ''
  } else {
    return data.data
  }
}