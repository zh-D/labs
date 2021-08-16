const express = require('express')
const app = express()
let PORT = process.env.PORT || 3000
const data = require('./data.json')

app.get('/', (req, res) => {
    res.send('<h1>My Node App</h1>')
})

app.get("/api", (req, res) => {
    res.send(data)
})

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
})