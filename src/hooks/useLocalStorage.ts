import React, { useEffect, useRef, useState } from 'react';

export function useLocalStorage<T>(
  key: string,
  defaultState: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  // To sync up with SSR/SSG, we need to make subsequent load on the client side.
  const [firstLoadDone, setFirstLoadDone] = useState(false);

  const [value, setValue] = useState<T>(defaultState);

  useEffect(() => {
    setFirstLoadDone(true);
  }, []);

  useEffect(() => {
    if (!firstLoadDone) {
      return;
    }
    let value: T;
    try {
      if (!localStorage.getItem(key)) {
        value = defaultState;
      } else {
        value = JSON.parse(localStorage.getItem(key)!) as any;
      }
    } catch (e) {
      value = defaultState;
    }
    setValue(value);
  }, [key, firstLoadDone]);

  const updateValue = (v: any) => {
    let newValue: T;
    if (typeof v === 'function') {
      newValue = v(value);
    } else {
      newValue = v;
    }
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  };
  return [value, updateValue];
}
