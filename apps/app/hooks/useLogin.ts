import dayjs from 'dayjs'
import { useCallback, useEffect } from 'react'
import { useCookies } from 'react-cookie'
import type { GetServerSidePropsContext, GetServerSideProps } from 'next'
import type { IncomingMessage } from 'http'
import universalCookie from 'cookie'
import {
  COOKIE_KEY,
  useAccount,
  useConnector,
  useConnectWalletDialog,
  useProvider,
  LoginInfo,
  useJWT,
  useLastConectorName,
  GlobalDimensions,
  SignatureStatus,
  useDidMount,
} from 'hooks'
import { useRouter } from 'next/router'
import { atom, useAtomValue } from 'jotai'
import { atomWithStorage, useUpdateAtom } from 'jotai/utils'
import { useAPI } from './useAPI'
import { RoutePath } from '../route/path'
import { API } from '../api'

export const useSetLoginCookie = () => {
  const [, setCookie] = useCookies([COOKIE_KEY])
  return useCallback((info: LoginInfo) => {
    const now = dayjs()
    setCookie(COOKIE_KEY, info, {
      path: '/',
      expires: now.add(14, 'day').toDate(),
    })
  }, [])
}

export const useIsAuthenticated = () => {
  const jwt = useJWT()
  return !!jwt
}

export const useLogin = () => {
  const api = useAPI()
  const setLoginInfo = useSetLoginCookie()
  return useCallback(
    async (message: string, sig: string) => {
      const { data } = await api.login(message, sig)
      const loginInfo = {
        address: api.getAddress(),
        jwt: data.jwt,
        uuid: data.uuid,
      }
      setLoginInfo(loginInfo)
      return loginInfo
    },
    [api]
  )
}

function parseCookies(req?: IncomingMessage) {
  try {
    const cookies = universalCookie.parse(
      req ? req.headers.cookie || '' : document.cookie
    )
    const cookie = cookies?.[COOKIE_KEY] ?? '{}'
    return JSON.parse(cookie)
  } catch (error) {
    return {}
  }
}

export const isAuthModalOpenAtom = atom(false)

export const useOpenAuthModal = () => {
  const setAuthModalOpen = useUpdateAtom(isAuthModalOpenAtom)
  return () => setAuthModalOpen(true)
}

export const useCloseAuthModal = () => {
  const setAuthModalOpen = useUpdateAtom(isAuthModalOpenAtom)
  return () => setAuthModalOpen(false)
}

export const useIsAuthModalOpen = () => useAtomValue(isAuthModalOpenAtom)

export const allowWithoutAuthPaths = new Set<string>([
  RoutePath.Home,
  RoutePath.WhiteList,
])

export const userPropertiesAtom = atomWithStorage<Record<string, any> | null>(
  'mail3_user_properties',
  null
)

export const useSetGlobalTrack = () => {
  const account = useAccount()
  const walletName = useLastConectorName()
  const setUserProperties = useUpdateAtom(userPropertiesAtom)
  return useCallback(
    async (jwt: string) => {
      try {
        const api = new API(account, jwt)
        const [{ data: userInfo }, { data: aliases }] = await Promise.all([
          api.getUserInfo(),
          api.getAliaes(),
        ])
        let sigStatus: SignatureStatus = SignatureStatus.OnlyText
        if (
          userInfo.card_sig_state === 'enabled' &&
          userInfo.text_sig_state === 'enabled'
        ) {
          sigStatus = SignatureStatus.BothEnabled
        } else if (
          userInfo.card_sig_state === 'enabled' &&
          userInfo.text_sig_state === 'disabled'
        ) {
          sigStatus = SignatureStatus.OnlyImage
        } else if (
          userInfo.card_sig_state === 'disabled' &&
          userInfo.text_sig_state === 'enabled'
        ) {
          sigStatus = SignatureStatus.OnlyText
        } else if (
          userInfo.card_sig_state === 'disabled' &&
          userInfo.text_sig_state === 'disabled'
        ) {
          sigStatus = SignatureStatus.BothDisabled
        }
        const config = {
          [GlobalDimensions.OwnEnsAddress]: aliases.aliases.length > 1,
          [GlobalDimensions.ConnectedWalletName]: walletName,
          [GlobalDimensions.WalletAddress]: account,
          [GlobalDimensions.SignatureStatus]: sigStatus,
        }
        gtag('set', 'user_properties', config)
        setUserProperties(config)
      } catch (error) {
        // todo sentry
      }
    },
    [account, walletName]
  )
}

export const useInitUserProperties = () => {
  const isAuth = useIsAuthenticated()
  const userProps = useAtomValue(userPropertiesAtom)
  const setUserProperties = useUpdateAtom(userPropertiesAtom)
  useDidMount(() => {
    if (userProps && isAuth) {
      gtag('set', 'user_properties', userProps)
    }
  })

  useEffect(() => {
    if (!isAuth) {
      gtag('set', 'user_properties', {})
      setUserProperties(null)
    }
  }, [isAuth])
}

export const useWalletChange = () => {
  const isAuth = useIsAuthenticated()
  const closeAuthModal = useCloseAuthModal()
  const [, , removeCookie] = useCookies([COOKIE_KEY])
  const { onOpen: openConnectWalletModal } = useConnectWalletDialog()
  const provider = useProvider()
  const router = useRouter()
  useEffect(() => {
    if (!isAuth && !allowWithoutAuthPaths.has(router.pathname)) {
      router.replace(RoutePath.Home)
    }
  }, [isAuth, router.pathname])

  useEffect(() => {
    const handleAccountChanged = () => {
      removeCookie(COOKIE_KEY, { path: '/' })
    }
    const handleDisconnect = () => {
      removeCookie(COOKIE_KEY, { path: '/' })
      closeAuthModal()
      openConnectWalletModal()
    }
    const w = window as any
    const { ethereum } = w
    if (ethereum && ethereum.on) {
      ethereum.on('disconnect', handleDisconnect)
      ethereum.on('accountsChanged', handleAccountChanged)
    }
    if (provider && provider.on) {
      provider.on('disconnect', handleDisconnect)
      provider.on('accountsChanged', handleAccountChanged)
    }
    return () => {
      if (ethereum && ethereum.off) {
        ethereum.off('disconnect', handleDisconnect)
        ethereum.off('accountsChanged', handleAccountChanged)
      }
      if (provider && provider.off) {
        provider.off('disconnect', handleDisconnect)
        provider.off('accountsChanged', handleAccountChanged)
      }
    }
  }, [provider])
}

export const useAuth = () => {
  const isAuth = useIsAuthenticated()
  const account = useAccount()
  const openAuthModal = useOpenAuthModal()
  const closeAuthModal = useCloseAuthModal()
  const router = useRouter()
  useEffect(() => {
    if (!isAuth && account) {
      openAuthModal()
    }
    if (!account) {
      closeAuthModal()
    }
  }, [isAuth, account])

  useEffect(() => {
    if (!isAuth && !allowWithoutAuthPaths.has(router.pathname)) {
      router.replace(RoutePath.Home)
    }
  }, [isAuth, router.pathname])

  useInitUserProperties()
  useWalletChange()
}

export const useAuthModalOnBack = () => {
  const connector = useConnector()
  const { onOpen } = useConnectWalletDialog()
  const closeAuthModal = useCloseAuthModal()
  return useCallback(async () => {
    await connector?.deactivate()
    closeAuthModal()
    onOpen()
  }, [connector])
}

export const getAuthenticateProps =
  (cb?: GetServerSideProps) => async (context: GetServerSidePropsContext) => {
    const props = await cb?.(context)
    const { req, res } = context
    const data = parseCookies(req)
    if (res) {
      if (typeof data.jwt !== 'string') {
        res.writeHead(307, {
          Location: '/',
          'Cache-Control': 'no-cache, no-store',
          Pragma: 'no-cache',
        })
        res.end()
      }
    }
    return {
      ...props,
    } as any
  }
