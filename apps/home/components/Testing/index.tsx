import { Flex, Heading, Text, Center, Box, Icon } from '@chakra-ui/react'
import React from 'react'
import { useTranslation } from 'next-i18next'
import { Button, ConnectWallet } from 'ui'
import { useAccount } from 'hooks'
import Mail3BackgroundSvg from 'assets/svg/mail3Background.svg'
import { Navbar } from '../Navbar'
import { Container } from '../Container'
import { Mascot } from './Mascot'
import { FooterText } from './FooterText'
import { QualificationText } from './QualificationText'

export const Testing: React.FC = () => {
  const { t } = useTranslation('testing')
  const account = useAccount()
  const isQualified = false
  const mascotIndex = (() => {
    if (!account) return 1
    if (isQualified) return 2
    return 3
  })()
  return (
    <Flex direction="column" align="center" minH="100vh">
      <Navbar headingText={t('beta-testing')} />
      <Container
        justify="space-between"
        maxH={{
          base: '607px',
          md: '700px',
        }}
      >
        <Icon
          as={Mail3BackgroundSvg}
          position="absolute"
          left="50%"
          top="50%"
          transform="translate(-50%, -50%)"
          w="calc(100% - 12px)"
          maxW="955px"
          h="auto"
          zIndex="-2"
        />
        <Heading
          fontSize={{
            base: '24px',
            md: '36px',
          }}
          pt={{ base: '0', md: '6px' }}
          h="46px"
        >
          {t('heading')}
        </Heading>
        <Flex
          direction="column"
          textAlign="center"
          whiteSpace="pre-line"
          fontSize={{
            base: '14px',
            md: '24px',
          }}
        >
          {account ? (
            <QualificationText isQualified={isQualified} />
          ) : (
            <>
              <Heading h="44px" fontSize="24px">
                {t('connect_wallet')}
              </Heading>
              <Text
                mt={{
                  base: '6px',
                  h: '1px',
                }}
              >
                {t('connect_wallet_tips')}
              </Text>
            </>
          )}
        </Flex>
        <Flex direction="column" align="center">
          <Center h="140px" maxW="200px">
            <Mascot imageIndex={mascotIndex} />
          </Center>
          <ConnectWallet
            renderConnected={(address) => (
              <Button variant="outline">
                {address.substring(0, 6)}…
                {address.substring(address.length - 4)}
              </Button>
            )}
          />
        </Flex>
        <Box
          fontSize={{
            base: '14px',
            md: '16px',
          }}
          mb={{
            base: '30px',
            md: '120px',
          }}
          textAlign="center"
          whiteSpace="pre-line"
        >
          {account ? (
            <FooterText isQualified={isQualified} />
          ) : (
            <>
              {t('testing-period', {
                date: '2022.6.7~2022.6.30',
              })}
            </>
          )}
        </Box>
      </Container>
    </Flex>
  )
}
