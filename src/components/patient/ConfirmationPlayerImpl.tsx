"use client"

import { Player } from "@remotion/player"
import { ConfirmationAnimation } from "./ConfirmationAnimation"

export function ConfirmationPlayerImpl() {
  return (
    <Player
      component={ConfirmationAnimation}
      durationInFrames={90}
      compositionWidth={120}
      compositionHeight={120}
      fps={30}
      style={{ width: 64, height: 64 }}
      autoPlay
      controls={false}
      clickToPlay={false}
      spaceKeyToPlayOrPause={false}
      doubleClickToFullscreen={false}
      acknowledgeRemotionLicense
    />
  )
}
