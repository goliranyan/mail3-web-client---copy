import {
  AvatarProps as RawAvatarProps,
  SkeletonCircle,
  SkeletonProps,
  LayoutProps,
  WrapItem,
  Image,
  ImageProps,
} from '@chakra-ui/react'
import { atom, useAtom } from 'jotai'
import { useQuery } from 'react-query'
import {
  isEthAddress,
  isSupportedAddress,
  getMail3Avatar,
  getPrimitiveAddress,
  isPrimitiveEthAddress,
  DefaultAvatarType,
  envStorage,
} from 'shared'
import { useEffect } from 'react'
import PngAvatarChristmas from 'assets/png/default_avatar_christmas.png'
import PngAvatar from 'assets/png/default_avatar.png'
import { RawAvatar } from './rawAvatar'

export interface AvatarProps extends RawAvatarProps {
  address: string
  src?: string
  skeletonProps?: SkeletonProps
  w?: LayoutProps['w']
  h?: LayoutProps['h']
  isSquare?: boolean
  isUseSvg?: boolean
  crossOrigin?: ImageProps['crossOrigin']
  onChangeAvatarCallback?: (currentAvatar?: string) => void
}

export const avatarsAtom = atom<Record<string, string | undefined>>({})

const EMPTY_PLACE_HOLDER_SRC = 'empty_place_holder_image'
// Constant will never change
export const DEFAULT_AVATAR_SRC =
  'https://mail-public.s3.amazonaws.com/users/default_avatar.png'

const getImageSrc = (img: string | { src: string }) =>
  typeof img === 'string' ? img : img.src

const defaultAvatarMap = {
  [DefaultAvatarType.Normal]: getImageSrc(PngAvatar),
  [DefaultAvatarType.Christmas]: getImageSrc(PngAvatarChristmas),
}

export const defaultAvatar = defaultAvatarMap[envStorage.getCurrentAvatar()]

export const Avatar: React.FC<AvatarProps> = ({
  address,
  size,
  skeletonProps,
  isSquare,
  onClick,
  src,
  onChangeAvatarCallback,
  ...props
}) => {
  const [avatars, setAvatars] = useAtom(avatarsAtom)
  const avatar = avatars?.[address]
  const width = props?.w
  const { isLoading } = useQuery(
    ['avatar', address],
    async () => {
      if (isPrimitiveEthAddress(address)) {
        const { data } = await getMail3Avatar(address)
        return data
      }
      const { data: info } = await getPrimitiveAddress(address)
      const { data } = await getMail3Avatar(info.eth_address)
      return data
    },
    {
      enabled: avatar == null && isEthAddress(address) && !src,
      refetchIntervalInBackground: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      onSuccess(d) {
        setAvatars((prev) => ({
          ...prev,
          [address]:
            d.avatar && d.avatar !== DEFAULT_AVATAR_SRC
              ? d.avatar
              : EMPTY_PLACE_HOLDER_SRC,
        }))
      },
      onError() {
        setAvatars((prev) => ({
          ...prev,
          [address]: EMPTY_PLACE_HOLDER_SRC,
        }))
      },
    }
  )

  useEffect(() => {
    if (src) {
      setAvatars((prev) => ({
        ...prev,
        [address]: src,
      }))
    }
  }, [src])

  useEffect(() => {
    onChangeAvatarCallback?.(avatar)
  }, [avatar])

  if (avatar === EMPTY_PLACE_HOLDER_SRC) {
    return isSupportedAddress(address) ? (
      <WrapItem
        w={width}
        h={width}
        maxW={width}
        maxH={width}
        borderRadius={isSquare ? undefined : '50%'}
        overflow="hidden"
        onClick={onClick}
        cursor={onClick ? 'pointer' : undefined}
        bg="white"
        {...props}
      >
        <Image
          src={defaultAvatar}
          w={width}
          h={width}
          crossOrigin="anonymous"
        />
      </WrapItem>
    ) : (
      <RawAvatar
        src=""
        borderRadius={isSquare ? 2 : 0}
        size={size}
        ignoreFallback
        onClick={onClick}
        bg="white"
        {...props}
      />
    )
  }

  return isLoading || !address ? (
    <SkeletonCircle
      borderRadius={isSquare ? '4px' : '50%'}
      w={props.w}
      h={props.h}
      size={size}
      {...skeletonProps}
    />
  ) : (
    <RawAvatar
      borderRadius={isSquare ? '2' : 0}
      src={avatar}
      size={size}
      ignoreFallback
      onClick={onClick}
      crossOrigin="anonymous"
      bg={avatar ? 'white' : undefined}
      {...props}
    />
  )
}
