
export function memoize (definition, invocation) {
  
  let lastInput;
  let lastValue;

  function update (input) {
    lastInput = input;
    lastValue = definition(...lastInput);
    return lastValue;
  }

  function cached (...input) {
    if (!lastInput) {
      return update(input);
    }
    const n = input.length;
    for (let i=0; i<n; i+=1) {
      if (input[i] !== lastInput[i]) {
        return update(input);
      }
    }
    return lastValue;
  };

  return (...args) => {
    return invocation(cached, ...args);
  };
};
