// THIS MUST RUN FIRST — fixes Nhost sessionStorage.onChange error
if (typeof window !== 'undefined') {
  try {
    const storage = window.sessionStorage;
    if (storage && typeof (storage as any).onChange === 'undefined') {
      Object.defineProperty(storage, 'onChange', {
        value: () => {},
        writable: true,
        configurable: true
      });
    }
  } catch(e) {
    // ignore
  }
}