const { Kafka, Partitioners } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'TaskMaster-app',
    brokers: ['localhost:9092']
});

const producer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner
});

const publishNotificationToKafka = async (topic, message) => {
    await producer.connect();
    await producer.send({
        topic: topic,
        messages: [
            {value: JSON.stringify(message)}
        ]
    });
    await producer.disconnect();
}

const consumer = kafka.consumer({groupId: 'taskmaster-notification-group'});

const consumeNotificationFromKafka = async (topics, callbackMap) => {
    await consumer.connect();

    for (const topic of topics) {
        await consumer.subscribe({ topic, fromBeginning: true });
    }

    await consumer.run({
        eachMessage: async ({topic, partition, message}) => {
            const handler = callbackMap[topic];
            if (handler) {
                try {
                    await handler(JSON.parse(message.value.toString()));
                } catch (error) {
                    console.error(`Error processing message for topic ${topic}:`, error);
                }
            } else {
                console.warn(`No handler found for topic ${topic}`);
            }
        }
    });
}

module.exports = {
    publishNotificationToKafka,
    consumeNotificationFromKafka
}