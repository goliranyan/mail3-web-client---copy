import React from 'react'
import styled from '@emotion/styled'
import Mascot1Svg from '../../assets/svg/mascot/1.svg'
import Mascot2Svg from '../../assets/svg/mascot/2.svg'
import Mascot3Svg from '../../assets/svg/mascot/3.svg'

const Mascot1 = styled(Mascot1Svg)`
  position: absolute;
  bottom: 0;
  left: 5%;
  width: 20%;
  height: auto;
  max-width: 190px;
  transition: 200ms;
  padding-top: 10px;
  @media (max-width: 767px) {
    width: auto;
    left: 0;
    height: 100%;
    max-width: 100%;
    max-height: 100vw;
  }
`

const Mascot2 = styled(Mascot2Svg)`
  position: absolute;
  bottom: 0;
  right: 5%;
  width: 20%;
  height: auto;
  max-width: 190px;
  transition: 200ms;
  margin-bottom: 10px;
  padding: 10px 0;
  @media (max-width: 767px) {
    width: auto;
    height: 100%;
    right: 10px;
    max-width: calc(100% - 20px);
    margin-bottom: 0;
  }
`

const Mascot3 = styled(Mascot3Svg)`
  position: absolute;
  bottom: 0;
  right: 5%;
  width: 20%;
  height: auto;
  max-width: 190px;
  transition: 200ms;
  padding: 10px 0;
  @media (max-width: 767px) {
    width: auto;
    height: 100%;
    right: 0;
  }
`

export const Mascot: React.FC<{
  imageIndex?: 1 | 2 | 3
}> = ({ imageIndex = 1 }) => {
  const imageMap = {
    1: <Mascot1 />,
    2: <Mascot2 />,
    3: <Mascot3 />,
  }
  return imageMap[imageIndex]
}
