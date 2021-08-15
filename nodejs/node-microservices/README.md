express + amqplib + rabbitmq(run in docker)

try

```powershell
docker run -p 5672:5672 rabbitmq

npm install

cd publisher && nodemon index

cd consumer && nodemon index
```

visit localhost:5001/send or localhost:5001/post (you may need a postman to send msg by post method), then you can find message sent to the consumer.

