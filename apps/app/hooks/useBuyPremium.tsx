import {
  Box,
  Center,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Spinner,
  Text,
} from '@chakra-ui/react'
import { noop, PromiseObj } from 'hooks'
import { atom, useAtomValue } from 'jotai'
import { selectAtom, useUpdateAtom } from 'jotai/utils'
import { useCallback, useState } from 'react'
import { ReactComponent as SvgDiamond } from 'assets/subscribe-page/diamond.svg'
import { ReactComponent as SvgDiamondOk } from 'assets/subscribe-page/diamond-success.svg'
import { Trans, useTranslation } from 'react-i18next'
import { truncateAddress } from 'shared'
import { Button } from 'ui'

const fnSelector = (a: PromiseObj) => a.fn

export interface BuyPremiumDialogOptions {
  addr?: string
  suffixName?: string
}

const openAtom = atom(false)
const loadingAtom = atom(false)
const onCloseObjAtom = atom<PromiseObj>({ fn: noop })
const optionsAtom = atom<BuyPremiumDialogOptions>({})
const onCloseAtom = selectAtom(onCloseObjAtom, fnSelector)

export const useBuyPremiumModel = () => {
  const isOpen = useAtomValue(openAtom)
  const options = useAtomValue(optionsAtom)
  const isLoading = useAtomValue(loadingAtom)
  const onClose = useAtomValue(onCloseAtom)

  return {
    isOpen,
    options,
    isLoading,
    onClose,
  }
}

export const useBuyPremium = () => {
  const setOptions = useUpdateAtom(optionsAtom)
  const setIsOpen = useUpdateAtom(openAtom)
  const setIsLoading = useUpdateAtom(loadingAtom)
  const setOnClose = useUpdateAtom(onCloseObjAtom)

  const callback = useCallback(
    async ({ ...options }) => {
      setOptions(options)
      setIsOpen(true)
      setOnClose({
        fn: async () => {
          setIsOpen(false)
          options?.onClose()
        },
      })
    },
    [setOptions, setIsOpen, setIsLoading, setOnClose]
  )

  return callback
}

const BuyIframe: React.FC<{ suffixName?: string }> = ({ suffixName }) => {
  const iframeSrc = `https://dev.daodid.id/frame/?bit=${suffixName}&theme=light`
  const [loading, setLoading] = useState(true)

  const onload = () => {
    setLoading(false)
  }

  return (
    <Center mt="8px" position="relative">
      <iframe
        src={iframeSrc}
        onLoad={onload}
        title="daodid"
        width="504"
        height="190"
      />
      {loading ? (
        <Center position="absolute" top="0" left="0" w="full" h="full">
          <Spinner />
        </Center>
      ) : null}
    </Center>
  )
}

export const BuySuccess: React.FC<{ name: string }> = ({ name }) => {
  const [t] = useTranslation(['subscription-article'])

  return (
    <Center flexDirection="column" p="32px">
      <Icon as={SvgDiamondOk} w="48px" h="48px" />
      <Text
        mt="10px"
        fontWeight="500"
        fontSize="14px"
        lineHeight="20px"
        color="#000"
        textAlign="center"
      >
        <Trans
          components={{
            b: (
              <Box as="span" color="#4E51F4" fontSize="16px" fontWeight={700} />
            ),
          }}
          values={{ name }}
          i18nKey="buy-ok"
          t={t}
        />
      </Text>

      <Text
        mt="16px"
        fontWeight="300"
        fontSize="12px"
        lineHeight="16px"
        textAlign="center"
      >
        {t('notifications')}
      </Text>

      <Button mt="16px">{t('continue')}</Button>
    </Center>
  )
}

export const BuyForm: React.FC<{ addr?: string; suffixName?: string }> = ({
  addr,
  suffixName,
}) => {
  const [t] = useTranslation(['subscription-article'])

  return (
    <Center flexDirection="column" p="32px 0">
      <Center>
        <Icon as={SvgDiamond} w="32px" h="32px" />
        <Box ml="8px" fontWeight="700" fontSize="20px" lineHeight="32px">
          {t('buy-title')}
        </Box>
      </Center>
      <Center
        mt="15px"
        fontWeight="400"
        fontSize="14px"
        lineHeight="16px"
        color="#868686"
      >
        {t('powered-by')}
      </Center>

      <BuyIframe suffixName={suffixName} />
      <Center mt="24px" fontWeight="400" fontSize="12px" color="#FF6B00">
        {t('wallet')}
      </Center>
      <Center
        mt="10px"
        background="#F2F2F2"
        borderRadius="200px;"
        fontWeight="500"
        fontSize="14px"
        color="#737373"
        padding="4px 32px"
      >
        {truncateAddress(addr ?? '')}
      </Center>
    </Center>
  )
}

export const BuyPremiumDialog: React.FC = () => {
  const { options, isOpen, onClose } = useBuyPremiumModel()

  const { addr, suffixName } = options

  const isOk = false

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent p="0" maxW={isOk ? '305px' : '548px'}>
        <ModalCloseButton />
        <ModalBody p="0">
          <BuyForm addr={addr} suffixName={suffixName} />
          {/* <BuySuccess name="nickname" /> */}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
