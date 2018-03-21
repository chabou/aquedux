import { createAqueduxClient } from 'aquedux-client'

const setupAqueduxChannels = client => {
  // Listen to ALL tournaments.
  client.addChannel('todos', (oldState, action) => {
    return {
      ...oldState,
      todos: action.snapshot
    }
  })
}

const configureAquedux = (store, endpoint) => {
  const client = createAqueduxClient(store, { endpoint })
  setupAqueduxChannels(client)
  return client
}

export default configureAquedux
