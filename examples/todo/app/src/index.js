import React from 'react'
import { render } from 'react-dom'
import { createStore, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import * as fromAquedux from 'aquedux-client'
import App from './components/App'
import rootReducer from './reducers'
import configureAquedux from './configureAquedux'

//const store = createStore(rootReducer)
const middlewares = applyMiddleware(thunk, fromAquedux.aqueduxMiddleware)
const enhancer = compose(middlewares)
const store = createStore(fromAquedux.wrapStoreReducer(rootReducer), {}, enhancer)

const port = process.env.REACT_APP_AQUEDUX_PORT || '4242'
const host = process.env.REACT_APP_AQUEDUX_HOST || 'localhost'
const protocol = process.env.REACT_APP_AQUEDUX_PROTOCOL || 'http'
const endpoint = `${protocol}://${host}:${port}/aquedux`
const aquedux = configureAquedux(store, endpoint)
aquedux.start(host, port, protocol)
store.dispatch(fromAquedux.subscribeToChannel('todos'))
render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
