import envConfig from '#config/env.config.js';

export const kafkaConfig = {
  clientId: envConfig.APP_NAME,
  brokers: envConfig.KAFKA_BROKERS,
  connectionTimeout: 10000,
  requestTimeout: 30000,
  retry: {
    initialRetryTime: 300,
    retries: 10,
    maxRetryTime: 30000,
    factor: 0.2,
    multiplier: 2,
  },
};

export const TOPICS = {
  WORKFLOW_COMMANDS: 'workflow_commands',   // Outbox Relay/Worker → Orchestrator
  ACTION_COMMANDS: 'action_commands',       // Orchestrator → Worker
  DEAD_LETTER_QUEUE: 'dead_letter_queue',   // Orchestrator/Worker → DLQ
};


export const TOPIC_CONFIGS = [
  {
    topic: TOPICS.WORKFLOW_COMMANDS,
    numPartitions: 3,
    replicationFactor: 1,
  },
  {
    topic: TOPICS.ACTION_COMMANDS,
    numPartitions: 3,
    replicationFactor: 1,
  },
  {
    topic: TOPICS.DEAD_LETTER_QUEUE,
    numPartitions: 1,
    replicationFactor: 1,
  }
];

export const CONSUMER_GROUPS = {
  ORCHESTRATOR: 'orchestrator-group',
  WORKER: 'worker-group',
  DLQ: 'dlq-group',
};

export default kafkaConfig;

// ref: https://kafka.js.org/docs/introduction
