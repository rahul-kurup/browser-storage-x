const Storages = Object.freeze({
  local: 'local',
  session: 'session',
})

export type StorageType = keyof typeof Storages;

export default Storages;
