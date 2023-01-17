import { useCallback, useEffect } from 'react'
import {
  createStore,
  get as getDataByIndexedDb,
  keys as getIndexedDbKeys,
} from 'idb-keyval'
import { atom, useAtom } from 'jotai'
import { useAPI } from './useAPI'
import { FirebaseUtils } from '../utils/firebase'

export async function getCurrentToken() {
  const FirebaseMessagingStore = createStore(
    'firebase-messaging-database',
    'firebase-messaging-store'
  )
  const [currentTokenKey] = await getIndexedDbKeys(FirebaseMessagingStore)
  if (!currentTokenKey) return null
  return getDataByIndexedDb<{
    token: string
    createTime: number
    subscriptionOptions: {
      auth: string
      endpoint: string
      p256dh: string
      swScope: string
      vapidKey: string
    }
  }>(currentTokenKey, FirebaseMessagingStore)
}

const firebaseUtilsAtom = atom<FirebaseUtils | null>(null)
export function useFirebaseUtils() {
  const [firebaseUtils, setFirebaseUtils] = useAtom(firebaseUtilsAtom)
  const initializeFirebaseUtils = useCallback(() => {
    if (!firebaseUtils) {
      const init = new FirebaseUtils()
      setFirebaseUtils(init)
      return init
    }
    return firebaseUtils
  }, [firebaseUtils, setFirebaseUtils])
  const getSafeFirebaseUtils = useCallback(
    () => firebaseUtils || initializeFirebaseUtils(),
    [firebaseUtils, initializeFirebaseUtils]
  )
  useEffect(() => {
    initializeFirebaseUtils()
  }, [])
  return { firebaseUtils, initializeFirebaseUtils, getSafeFirebaseUtils }
}

export function useDeleteFCMToken() {
  const api = useAPI()
  const { initializeFirebaseUtils } = useFirebaseUtils()
  return useCallback(async () => {
    const currentTokenItem = await getCurrentToken()
    if (currentTokenItem) {
      await api
        .updateRegistrationToken(currentTokenItem.token, 'stale')
        .catch(console.error)
    }
    await initializeFirebaseUtils()
      .deleteFirebaseMessagingToken()
      .catch(console.error)
  }, [api, initializeFirebaseUtils])
}

export function useGetFCMToken() {
  const api = useAPI()
  const { initializeFirebaseUtils } = useFirebaseUtils()
  return useCallback(async () => {
    const token = await initializeFirebaseUtils().getFirebaseMessagingToken()
    const currentServerNotificationState = await api
      .getRegistrationTokenState(token)
      .then((res) => res.data.state)
      .catch(() => 'stale')
    if (currentServerNotificationState === 'active') {
      return token
    }
    await api.updateRegistrationToken(token, 'active')
    return token
  }, [api, initializeFirebaseUtils])
}
