export function resetAppData() {
  Object.keys(localStorage)
    .filter((key) => key.startsWith('sims.'))
    .forEach((key) => localStorage.removeItem(key))
  window.location.reload()
}
