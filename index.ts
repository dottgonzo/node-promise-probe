import { exec } from 'child_process'
import { stat } from 'fs'

export interface IFFFormat {
  filename: string
  nb_streams: number
  nb_programs: number
  format_name: string
  format_long_name: string
  start_time: string
  duration: string
  size: string
  bit_rate: string
  probe_score: number
  tags: {
    major_brand: string
    minor_version: string
    compatible_brands: string
    creation_time: string
    encoder: string
  }
}

export interface IVideoStream extends IStream {
  sample_aspect_ratio: string
  display_aspect_ratio: string
  pix_fmt: string
  level: number
  width: number
  height: number
  color_range: string
  color_space: string
  color_transfer: string
  color_primaries: string
  chroma_location: string
}
export interface IAudioStream extends IStream {
  sample_fmt: string
  sample_rate: string
  channels: number
  channel_layout: string
}
export interface IStream {
  // TODO: must be typed better

  sample_fmt?: string
  sample_rate?: string
  channels?: number
  channel_layout?: string

  index: number
  codec_name: string
  codec_long_name: string
  profile: string
  codec_type: string
  codec_time_base: string
  codec_tag_string: string
  codec_tag: string
  width?: number
  height?: number
  coded_width: number
  coded_height: number
  has_b_frames: number
  sample_aspect_ratio?: string
  display_aspect_ratio?: string
  pix_fmt?: string
  level?: number
  color_range?: string
  color_space?: string
  color_transfer?: string
  color_primaries?: string
  chroma_location?: string
  refs?: number
  is_avc?: string
  nal_length_size: string
  r_frame_rate: string
  avg_frame_rate: string
  time_base: string
  start_pts: number
  start_time: string
  duration_ts: number
  duration: string
  bit_rate: string
  bits_per_raw_sample: string
  nb_frames: string
  disposition: {
    default: number
    dub: number
    original: number
    comment: number
    lyrics: number
    karaoke: number
    forced: number
    hearing_impaired: number
    visual_impaired: number
    clean_effects: number
    attached_pic: number
    timed_thumbnails: number
  }
  tags: {
    creation_time: string
    language: string
    handler_name: string
  }
}

export interface IFfprobe {
  streams: IStream[]
  format: IFFFormat
  audio?: IAudioStream
  video?: IVideoStream
}

function ffprobe(file: string): Promise<IFfprobe> {
  return new Promise<IFfprobe>((resolve, reject) => {
    if (!file) return reject(new Error('no file provided'))

    stat(file, (err, stats) => {
      if (err) return reject(new Error('wrong file provided'))

      exec('ffprobe -v quiet -print_format json -show_format -show_streams ' + file, (error, stdout, stderr) => {
        if (error) return reject(error)
        if (!stdout) return reject(new Error("can't probe file " + file))

        let ffprobed: IFfprobe

        try {
          ffprobed = JSON.parse(stdout)
        } catch (err) {
          return reject(err)
        }

        for (let i = 0; i < ffprobed.streams.length; i++) {
          if (ffprobed.streams[i].codec_type === 'video') ffprobed.video = ffprobed.streams[i] as IVideoStream
          if (ffprobed.streams[i].codec_type === 'audio' && ffprobed.streams[i].channels)
            ffprobed.audio = ffprobed.streams[i] as IAudioStream
        }
        resolve(ffprobed)
      })
    })
  })
}



export default ffprobe