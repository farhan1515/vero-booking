"use client"

import { Player } from "@remotion/player"
import { HeroAnimation } from "./HeroAnimation"

export function HeroPlayerImpl() {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        paddingTop: "88.89%", // 320/360 = 88.89% — intrinsic 360:320 ratio box
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
          component={HeroAnimation}
          durationInFrames={220}
          compositionWidth={360}
          compositionHeight={320}
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
