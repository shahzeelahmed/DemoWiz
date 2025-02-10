import { MP4Clip } from '@webav/av-cliper'

export class VideoDecoder {
  private clip: MP4Clip | null = null
  mp4Dur: Number | null = 0
  decoderMap = new Map<string, MP4Clip>()

  async loadVideo (source: ReadableStream<Uint8Array>) {
    this.clip = new MP4Clip(source)
    await this.clip.ready
    this.mp4Dur = Math.round(this.clip.meta.duration / 1e6)
    return this.clip.meta
  }
  async decode ({
    id,
    stream
  }: {
    id: string
    stream?: ReadableStream<Uint8Array>
  }) {
    try {
      if (!stream) {
        throw new Error(`No stream provided for ID: ${id}`)
      }

      const fileStream = await writeFile(id, stream)

      const videoClip = new MP4Clip(fileStream)

      await videoClip.ready

      this.decoderMap.set(id, videoClip)
      return videoClip
    } catch (error) {
      console.error(`Error decoding video ${id}:`, error)
      return null
    }
  }
}
