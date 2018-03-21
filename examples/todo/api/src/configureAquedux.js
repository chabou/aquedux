import * as fromAquedux from 'aquedux-server'

const todoTypes = [
  'ADD_TODO',
  'TOGGLE_TODO'
];

const configureAquedux = (store, host, port) => {
  const aqueduxOptions = {
    statefullTypes: todoTypes,
    secret: 'todoExample'
  }

  let server = fromAquedux.createAqueduxServer(store, aqueduxOptions)

  server.addChannel(
    'todos',
    action => todoTypes.indexOf(action.type) !== -1,
    (getState, ignored) => {
      const todos = getState().todos
      return todos
    },
    'todos'
  )

  return () => server.start(host, port)
}

export default configureAquedux