const redis = require("redis");
const client = redis.createClient({
  url: 'redis://127.0.0.1:6379'
});

client.on("error", function (error) {
  console.error(error);
});

// client.set("key", "привет медвед");
// client.set("test key", JSON.stringify({ name: 'Vasya', age: 29, date: new Date().toISOString()}), redis.print);
// client.get("key", redis.print);
client.multi()
