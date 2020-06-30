const express = require('express')
const app = new express()
const kline = require('./kline')
const vline = require('./vline')
app.get('/api/kline', kline)
app.get('/api/vline', vline)
app.listen(9527)