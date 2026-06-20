import type { Components } from 'react-markdown'

function extractDirective(children: React.ReactNode, prefix: string): string | null {
  const text = String(children ?? '')
  const match = text.match(new RegExp(`^::${prefix}\\[(.+?)\\]$`))
  return match ? match[1] : null
}

export const markdownComponents: Components = {
  p({ children }) {
    const text = String(children)

    const audioUrl = (() => {
      const m = text.match(/^::audio\[(.+?)\]$/)
      return m ? m[1] : null
    })()
    if (audioUrl) {
      return (
        <div className="my-4">
          <audio controls src={audioUrl} className="w-full rounded" />
        </div>
      )
    }

    const videoUrl = (() => {
      const m = text.match(/^::video\[(.+?)\]$/)
      return m ? m[1] : null
    })()
    if (videoUrl) {
      const isYouTube = /youtu\.?be/.test(videoUrl)
      const isVimeo = /vimeo\.com/.test(videoUrl)
      if (isYouTube || isVimeo) {
        let embedUrl = videoUrl
        if (isYouTube) {
          const id = videoUrl.match(/(?:v=|youtu\.be\/)([^&?]+)/)?.[1]
          embedUrl = `https://www.youtube.com/embed/${id}`
        } else if (isVimeo) {
          const id = videoUrl.match(/vimeo\.com\/(\d+)/)?.[1]
          embedUrl = `https://player.vimeo.com/video/${id}`
        }
        return (
          <div className="my-4 aspect-video w-full overflow-hidden rounded-lg">
            <iframe
              src={embedUrl}
              className="h-full w-full"
              allowFullScreen
              title="Embedded video"
            />
          </div>
        )
      }
    }

    return <p>{children}</p>
  },
}

// Suppress unused warning — extractDirective used for type safety
void extractDirective
