import { Kafka } from 'kafkajs';
import { kafkaConfig, TOPIC_CONFIGS } from '#config/kafka.config.js';
import logger from '#util/logger.js';

let kafkaClient = null;
let producer = null;
const activeConsumers = new Set();

export function getKafkaClient() {
  if (!kafkaClient) {
    kafkaClient = new Kafka(kafkaConfig);
  }
  return kafkaClient;
}

export async function ensureTopics() {
  const admin = getKafkaClient().admin();
  try {
    await admin.connect();
    const existingTopics = await admin.listTopics();
    const newTopics = TOPIC_CONFIGS.filter(t => !existingTopics.includes(t.topic));

    if (newTopics.length > 0) {
      await admin.createTopics({ topics: newTopics });
      logger.info(`Kafka topics created: ${newTopics.map(t => t.topic).join(', ')}`);
    } else {
      logger.info('All Kafka topics already exist');
    }
  } finally {
    await admin.disconnect();
  }
}

export async function getProducer() {
  if (!producer) {
    producer = getKafkaClient().producer();
    await producer.connect();
    logger.info('Kafka producer connected');
  }
  return producer;
}

export async function produceMessage(topic, partitionKey, payload) {
  try {
    const prod = await getProducer();
    await prod.send({
      topic,
      messages: [{
        key: partitionKey,
        value: JSON.stringify(payload),
        headers: {
          timestamp: Date.now().toString(),
        },
      }],
    });
  } catch (error) {
    logger.error('Failed to produce Kafka message', { topic, partitionKey, error: error.message });
    throw error;
  }
}

export async function createConsumer(groupId) {
  const consumer = getKafkaClient().consumer({ groupId });
  await consumer.connect();
  activeConsumers.add(consumer);
  logger.info(`Kafka consumer connected: ${groupId}`);
  return consumer;
}

export async function disconnectKafka() {
  for (const consumer of activeConsumers) {
    try {
      await consumer.disconnect();
    } catch (err) {
      logger.error('Error disconnecting Kafka consumer', { error: err.message });
    }
  }
  activeConsumers.clear();

  if (producer) {
    await producer.disconnect();
    producer = null;
  }

  logger.info('Kafka fully disconnected (producer + consumers)');
}

export default { getKafkaClient, ensureTopics, getProducer, produceMessage, createConsumer, disconnectKafka };

// ref: https://kafka.js.org/docs/introduction
