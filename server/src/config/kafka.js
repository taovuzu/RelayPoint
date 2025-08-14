import { Kafka } from 'kafkajs';
import logger from '../utils/logger.js';

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'relay-point',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  retry: {
    initialRetryTime: 100,
    retries: 8
  },
  connectionTimeout: 30000,
  requestTimeout: 30000,
});

export const KAFKA_TOPICS = {
  WORKFLOWS: process.env.KAFKA_TOPIC_WORKFLOWS || 'workflow-execution',
  NOTIFICATIONS: process.env.KAFKA_TOPIC_NOTIFICATIONS || 'workflow-notifications'
};

let producer = null;

export const getProducer = async () => {
  if (!producer) {
    producer = kafka.producer({
      maxInFlightRequests: 1,
      idempotent: true,
      transactionTimeout: 30000,
      retry: {
        retries: 5
      }
    });

    await producer.connect();
    logger.info('Kafka producer connected successfully');
  }
  return producer;
};

export const createConsumer = (groupId) => {
  return kafka.consumer({
    groupId: groupId || process.env.KAFKA_GROUP_ID || 'relay-point-workers',
    sessionTimeout: 30000,
    rebalanceTimeout: 60000,
    heartbeatInterval: 3000,
    allowAutoTopicCreation: false,
    retry: {
      retries: 5
    }
  });
};

export const createAdmin = () => {
  return kafka.admin();
};

export const initializeTopics = async () => {
  const admin = createAdmin();

  try {
    await admin.connect();
    logger.info('Kafka admin connected');

    const existingTopics = await admin.listTopics();
    const topicsToCreate = [];

    Object.values(KAFKA_TOPICS).forEach(topic => {
      if (!existingTopics.includes(topic)) {
        topicsToCreate.push({
          topic,
          numPartitions: 3,
          replicationFactor: 1,
          configEntries: [
            { name: 'cleanup.policy', value: 'delete' },
            { name: 'retention.ms', value: '604800000' }, // 7 days
            { name: 'segment.ms', value: '86400000' } // 1 day
          ]
        });
      }
    });

    if (topicsToCreate.length > 0) {
      await admin.createTopics({
        topics: topicsToCreate,
        waitForLeaders: true,
        timeout: 30000
      });
      logger.info(`Created Kafka topics: ${topicsToCreate.map(t => t.topic).join(', ')}`);
    } else {
      logger.info('All required Kafka topics already exist');
    }

  } catch (error) {
    logger.error('Failed to initialize Kafka topics', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  } finally {
    await admin.disconnect();
  }
};

export const shutdownKafka = async () => {
  try {
    if (producer) {
      await producer.disconnect();
      producer = null;
      logger.info('Kafka producer disconnected');
    }
  } catch (error) {
    logger.error('Error during Kafka shutdown', {
      error: error.message,
      stack: error.stack
    });
  }
};

export { kafka };
