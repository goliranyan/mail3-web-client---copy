import { Center, LinkBox, LinkOverlay, Text } from '@chakra-ui/react'
import styled from '@emotion/styled'
import { Avatar, Button } from 'ui'

interface UserInfoProps {
  priAddress: string
  nickname: string
  mailAddress: string
  desc?: string
}

const AvatarArea = styled(LinkBox)`
  &:hover {
    .nickname {
      text-decoration: underline;
    }
  }
`

export const UserInfo: React.FC<UserInfoProps> = ({
  priAddress,
  nickname,
  mailAddress,
  desc,
}) => (
  <Center
    p="48px 32px"
    w="305px"
    flexDirection="column"
    justifyContent="flex-start"
    border="1px solid rgba(0, 0, 0, 0.1)"
  >
    <AvatarArea w="100%">
      <LinkOverlay href="#">
        <Center flexDirection="column" justifyContent="flex-start">
          <Avatar address={priAddress} borderRadius="50%" w="100px" h="100px" />
          <Text
            className="nickname"
            fontWeight="700"
            fontSize="18px"
            lineHeight="24px"
            mt="8px"
          >
            {nickname}
          </Text>
        </Center>
      </LinkOverlay>
    </AvatarArea>

    <Text fontWeight="500" fontSize="14px" lineHeight="16px" mt="14px">
      {mailAddress}
    </Text>

    <Text
      fontWeight="400"
      fontSize="12px"
      lineHeight="18px"
      color="rgba(0, 0, 0, 0.7)"
      mt="32px"
    >
      {desc}
    </Text>

    <Button mt="24px">Subscribe</Button>
  </Center>
)
