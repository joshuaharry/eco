export const mockSideEffects = async <T>(fn: () => T | Promise<T>) => {
  const originalLog = console.log;
  const originalExit = process.exit;
  const originalError = console.error;
  const logMock = jest.fn();
  const exitMock = jest.fn();
  const errorMock = jest.fn();
  console.error = errorMock;
  console.log = logMock;
  // eslint-disable-next-line
  // @ts-ignore
  process.exit = exitMock;
  const results = await fn();
  console.log = originalLog;
  console.error = originalError;
  process.exit = originalExit;
  return { logMock, errorMock, exitMock, results };
};
