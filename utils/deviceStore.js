const store = {};

export function saveDeviceAuth(userId, data) {
  store[userId] = data;
}

export function getDeviceAuth(userId) {
  return store[userId];
}
