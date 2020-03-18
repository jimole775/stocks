import { initPage } from './init-page'
export async function batchLink(urls, callback) {
  const page = await initPage(callback.onRequest, callback.onResponse)
  return loopLink(0)
  async function loopLink(i) {
    const url = urls[i]
    try {
      await page.goto(url, { timeout: 0 }).catch()
      callback.onLinked && callback.onLinked(page)
    } catch (error) {
      console.log(error)
    }
    // 增加一个随机的延迟，防止被请求被屏蔽
    return setTimeout(() => {
      if (i === urls.length - 1) {
        page.close()
        return callback.onEnd && callback.onEnd()
      }
      console.log('loading >> ', i)
      return loopLink(++i)
    }, Math.random() * 800 + Math.random() * 500 + Math.random() * 300 + Math.random() * 100 + 1000)
  }
}