import { lugarRepository } from './lugar.repository.js';

export const lugarService = {
  listPublic() {
    return lugarRepository.listActive();
  },
};
