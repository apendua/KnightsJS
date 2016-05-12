export const createQueue = () => {

  return store => {
    const queue = [];
    let current;

    const emptyQueue = noDelay => {
      if (queue.length === 0) {
        current = null;
        return;
      }

      const { action, callback } = queue[queue.length - 1];
      
      const state = store.getState();
      const delay = (!state.isPreloading && action.queue && action.queue.delay) || 0;

      const timeout = setTimeout(() => {

        const newAction = { ...action, queue: { skip: true } };

        callback(store.dispatch(newAction));
        queue.pop();

        emptyQueue();
      }, noDelay ? 0 : delay);

      current = { action, callback, timeout };
    };

    return next => action => {

      if (typeof action !== 'object' || (action.queue && action.queue.skip)) {
        return next(action);
      }

      if (current && action.queue && action.queue.noWait) {
        clearTimeout(current.timeout);
        emptyQueue(true); // empty immediately
      }

      return new Promise(callback => {
        queue.unshift({ action, callback });
        if (!current) emptyQueue();
      });
    };
  };

};
