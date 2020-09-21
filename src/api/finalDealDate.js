const path = require('path')
const readFileSync = require(`${global.utils}/read-file-sync.js`)
const { isString, isNumber } = require(`${global.utils}/assert.js`)
const code_name = require(`${global.db_dict}/code-name.json`)
const name_code = require(`${global.db_dict}/name-code.json`)
const readDirSync = require(`${global.utils}/read-dir-sync.js`)
const quest = require(`${global.utils}/quest`)
const moment = require('moment')
module.exports = function base (req, res) {
  return new Promise(async (resolve) => {
    return resolve({date: await getDate()})
  })
}

function getDate () {
  // # 上证指数的数据，可以从里面筛出交易的时间
  // date: "http://push2his.eastmoney.com/api/qt/stock/trends2/get?cb=jQuery1124012891801110637102_1584422853173&secid=1.000001&ut=fa5fd1943c7b386f172d6893dbfba10b&fields1=f1%2Cf2%2Cf3%2Cf4%2Cf5%2Cf6%2Cf7%2Cf8%2Cf9%2Cf10%2Cf11&fields2=f51%2Cf53%2Cf56%2Cf58&iscr=0&ndays=1&_=1584422853176"
  // dateReg: "push2his\\.eastmoney\\.com\\/api\\/qt\\/stock\\/trends2\\/get\\?"
  // SHome: "http://quote.eastmoney.com/zs000001.html"
  // 从URL上过滤出stockCode，然后拼接文件名，尝试读取数据
  return new Promise(async (resolve, reject) => {
    try {
      const dirtyData = await quest('http://push2his.eastmoney.com/api/qt/stock/trends2/get?cb=jQuery1124012891801110637102_1584422853173&secid=1.000001&ut=fa5fd1943c7b386f172d6893dbfba10b&fields1=f1%2Cf2%2Cf3%2Cf4%2Cf5%2Cf6%2Cf7%2Cf8%2Cf9%2Cf10%2Cf11&fields2=f51%2Cf53%2Cf56%2Cf58&iscr=0&ndays=1&_=1584422853176')
      const pureData = JSON.parse(dirtyData.replace(/^[\w\d_]*?\((.+?)\);$/ig, '$1'))
      const curDate = new Date((pureData.data.time || 0) * 1000)
      return resolve(moment(curDate).format('YYYY-MM-DD'))
    } catch (error) {
      console.log('getdate: ', error)
      // 一般情况下，quest失败，不是网络异常，就是服务器异常，异常状态一般持续数秒或者数分钟，
      // 为了防止无谓的请求，增加1秒间隔，多少能减少一下资源浪费
      return setTimeout(() => { getDate() }, 1000)
    }
  })
}