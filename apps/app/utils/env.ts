export const isWechat = () =>
  navigator.userAgent.toLowerCase().includes('micromessenger')

export const isImToken = () =>
  navigator.userAgent.toLowerCase().includes('imtoken')

export const isCoinbaseWallet = () => {
  const ethereum = window?.ethereum as
    | {
        isCoinbaseWallet?: boolean
        isCoinbaseBrowser?: boolean
      }
    | undefined
  return ethereum?.isCoinbaseWallet || ethereum?.isCoinbaseBrowser
}

export const isTrust = () => {
  const w = window as any
  return !!w?.ethereum?.isTrust
}
