import createAqueduxClient from './network/client'
import aqueduxReducer from './reducers'
import middleware from './network/middleware'
import actionWrapper from './utils/actionWrapper'
import { subscribeToChannel, unsubscribeFromChannel } from './network/channels'
import createStore from './createStore'
import wrapStoreReducer from './wrapStoreReducer'

// Think of a better name for onAquedux.
const onAquedux = actionWrapper
const aqueduxMiddleware = middleware

export {
  createStore,
  aqueduxMiddleware,
  aqueduxReducer,
  createAqueduxClient,
  wrapStoreReducer,
  onAquedux,
  subscribeToChannel,
  unsubscribeFromChannel
}
