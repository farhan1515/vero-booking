"use client"

import { Player } from "@remotion/player"
import { HowItWorksAnimation } from "./HowItWorksAnimation"

export function HowItWorksPlayerImpl() {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        paddingTop: "31.11%", // 280/900 = 31.11% — intrinsic 900:280 ratio box
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <Player
          component={HowItWorksAnimation}
          durationInFrames={210}
          compositionWidth={900}
          compositionHeight={280}
          fps={30}
          style={{ width: "100%", height: "100%" }}
          loop
          autoPlay
          controls={false}
          clickToPlay={false}
          spaceKeyToPlayOrPause={false}
          doubleClickToFullscreen={false}
          acknowledgeRemotionLicense
        />
      </div>
    </div>
  )
}
