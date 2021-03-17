const sc = require('node-nats-streaming').connect('nats-cluster', 'test1', {
  servers: ['nats://localhosts:14222']
})

sc.on('connect', () => {
  console.log('[NATS] connect');
})

// emitted whenever the client disconnects from a server
sc.on('disconnect', () => {
  console.log('[NATS] disconnect');
});

// emitted whenever the client is attempting to reconnect
sc.on('reconnecting', () => {
  console.log('reconnecting');
});

// emitted whenever the client reconnects
// reconnect callback provides a reference to the connection as an argument
sc.on('reconnect', () => {
  console.log(`[NATS] reconnect`);
  console.log(`reconnected to ${sc.nc.currentServer.url}`)
});

// emitted whenever the server returns a permission error for
// a publish/subscription for the current user. This sort of error
// means that the client cannot subscribe and/or publish/request
// on the specific subject
sc.on('permission_error', function (err) {
  console.error('[NATS] got a permissions error', err.message);
});

sc.on('connection_lost', async (error) => {
  console.log('disconnected from STAN: ', error);
});

sc.on('error', (error) => {
  console.log('[Nats] error', error);
});

// emitted when the connection is closed - once a connection is closed
// the client has to create a new connection.
sc.on('close', () => {
  process.exit(1)
})

module.exports = sc;
