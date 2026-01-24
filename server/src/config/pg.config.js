const pgConfig = {
  max: 20,                      // max connections in the pool
  idleTimeoutMillis: 30000,     // close idle connections after 30s
  connectionTimeoutMillis: 5000 // fail if can't connect in 5s
};

export default pgConfig;

// ref: https://www.pgconfig.org/
