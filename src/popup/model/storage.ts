const Storages = Object.freeze({
  local: 'local',
  session: 'session',
  // cookie: 'cookie',
})

export type StorageType = keyof typeof Storages;

export default Storages;
