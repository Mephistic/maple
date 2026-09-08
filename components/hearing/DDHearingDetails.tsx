import { useTranslation } from "next-i18next"
import { useEffect, useState } from "react"
import styled from "styled-components"
import { Carousel, Col, Container, Row } from "../bootstrap"
import { Back } from "../shared/CommonComponents"
import { Internal } from "../links"
import {
  DDHearing,
  DDUtterance,
  speakerName
} from "./digitalDemocracyApi"

const ddApiPersonIdToMemberId: Record<number, string> = {
    211022: "PRF0", // Paul Feeney
    211000: "MSD1", // Michael Day
    211028: "RCF0", // Ryan Fattman
    210993: "K_H1", // Kate Hogan
    210961: "DTV1", // David Vieira
    210945: "CFF0", // Cindy Friedman
    210928: "BRF0", // Barry Finegold
    210931: "BPC0", // Brendan Crighton
    210924: "AHP1", // Alice Peisch
    210964: "FAM1", // Frank Moran
}

const VideoWrapper = styled.div`
  max-width: 700px;
  margin: 0 auto;
`

/* padding-top % is relative to VideoWrapper's width, so max-width must live there, not here */
const VideoParent = styled.div`
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* For 16:9 aspect ratio */
  overflow: hidden;
`

const VideoChild = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
`

const TranscriptContainer = styled(Container)`
  background-color: var(--maple-surface-base);
`

const TranscriptRow = styled(Row)`
  &:nth-child(even) {
    background-color: white;
  }
  &:nth-child(odd) {
    background-color: var(--maple-surface-transcript-stripe);
  }
`

const Speaker = styled.div`
  font-weight: 600;
  color: var(--maple-text-strong);
`

export const DDHearingDetails = ({ hearing }: { hearing: DDHearing }) => {
  const { t } = useTranslation(["common", "hearing"])
  const [utterances, setUtterances] = useState<DDUtterance[] | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async function () {
      const res = await fetch(`/api/hearings/${hearing.hid}/utterances`)
      if (!res.ok || cancelled) return
      const body: { utterances: DDUtterance[] } = await res.json()
      if (!cancelled) setUtterances(body.utterances)
    })()
    return () => {
      cancelled = true
    }
  }, [hearing.hid])

  const videos = [...hearing.hearing_videos].sort(
    (a, b) => (a.start_time ?? a.uid) - (b.start_time ?? b.uid)
  )

  return (
    <Container className="mt-3 mb-3">
      <Row className="mb-3">
        <Col>
          <Back href="/hearings">{t("back_to_hearings")}</Back>
        </Col>
      </Row>

      <h1>{hearing.title}</h1>

      {videos.length > 0 ? (
        <Carousel
          className="mt-3"
          interval={null}
          indicators={videos.length > 1}
          controls={videos.length > 1}
        >
          {videos.map(video => (
            <Carousel.Item key={video.uid}>
              <VideoWrapper>
                <VideoParent>
                  <VideoChild src={video.video_url} controls muted />
                </VideoParent>
              </VideoWrapper>
            </Carousel.Item>
          ))}
        </Carousel>
      ) : null}

      <TranscriptContainer className="mt-4 rounded">
        {utterances === null ? (
          <div className="py-2 px-2">
            {t("transcript_loading", { ns: "hearing" })}
          </div>
        ) : (
          utterances.map(utterance => {
            const name =
              speakerName(utterance) ?? t("unknown_speaker", { ns: "hearing" })
            const memberId =
              utterance.person_type === "legislator" && utterance.pid !== null
                ? ddApiPersonIdToMemberId[utterance.pid]
                : undefined

            return (
              <TranscriptRow className="py-2 px-2" key={utterance.uid}>
                <Speaker>
                  {memberId ? (
                    <Internal href={`/legislators/194/${memberId}`}>
                      {name}
                    </Internal>
                  ) : (
                    name
                  )}
                </Speaker>
                <div>{utterance.content}</div>
              </TranscriptRow>
            )
          })
        )}
      </TranscriptContainer>
    </Container>
  )
}
