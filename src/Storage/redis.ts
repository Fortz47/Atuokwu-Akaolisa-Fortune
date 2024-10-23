import { createClient, RedisClientType } from 'redis';

class RedisClient {
  private client;

  constructor() {
    this.client = createClient(); // Connects to 'redis://localhost:6379' by default
    // @ts-ignore
    this.registerConnectionListeners(this.client);
  }

  private registerConnectionListeners(client: RedisClientType) {
    client.on('error', (err) => {
      console.log(`Error connecting to Redis: ${err}`);
    })
    client.on('end', () => {
      console.log('Redis client has disconnected.');
    })
    client.on('connect', () => {
      console.log('Connected to Redis server.');
    });
  }

  async connectRedis() {
    await this.client.connect();
  }

  isAlive() {
    return this.client.isReady;
  }

  async set(key: string, value: string, exp?: number) {
    // expiration (exp) is in seconds
    if (exp) {
      await this.client.set(key, value);
    } else {
      await this.client.set(key, value, { EX: exp });
    }
  }
  
  async get(key: string): Promise<string | null> {
    const value = await this.client.get(key);
    return value;
  }

  async del(key: string) {
    await this.client.del(key);
  }
}

const redisClient = new RedisClient();
export default redisClient;