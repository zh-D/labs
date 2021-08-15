const express = require('express')
const amqp = require('amqplib')
const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

let channel
let connection

async function connect() {
    try {
        const amqpServer = "amqp://localhost:5672"
        connection = await amqp.connect(amqpServer)
        channel = await connection.createChannel()
        await channel.assertQueue("rabbit")
    } catch (err) {
        console.log(err);
    }
}

connect()

app.get("/send", async (req, res) => {
    const data = {
        name: "Ruby",
        age: 18
    }

    await channel.sendToQueue("rabbit", Buffer.from(JSON.stringify(data)))
    // await channel.close()
    // await connection.close()
    res.send("Done~")
})

app.post('/post', async (req, res) => {
    const data = req.body
    await channel.sendYoQueue("rabbit", Buffer.from(JSON.stringify(data)))
    res.send("Done!")
})

app.listen(5001, () => {
    console.log("listening on port 5001");
})
