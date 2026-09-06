module.exports = { Worker: class Worker { constructor() { throw new Error('Worker is not available in this environment'); } } };
