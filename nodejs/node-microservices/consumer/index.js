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

        channel.consume("rabbit", (data) => {
            const message = JSON.parse(data.content)
            console.log(message);

            // 防止重复内容
            channel.ack(data);
        })
    } catch (err) {
        console.log(err);
    }
}

connect()

app.listen(5002, () => {
    console.log("listening on port 5002");
})
