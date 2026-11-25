export function useRegisterSW() {
  return {
    offlineReady: [false, () => undefined] as [boolean, (v: boolean) => void],
    needRefresh: [false, () => undefined] as [boolean, (v: boolean) => void],
    updateServiceWorker: async () => undefined,
  };
}
