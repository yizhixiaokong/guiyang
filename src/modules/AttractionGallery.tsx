import { useState } from 'react'
import type { AttractionImage } from '../types'

interface AttractionGalleryProps {
  images: AttractionImage[]
  title: string
}

export function AttractionGallery({ images, title }: AttractionGalleryProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  if (images.length === 0) {
    return (
      <div className="attraction-gallery-empty">
        <p className="mini-label">Photo Archive</p>
        <p>当前还没有补入 {title} 的图片。</p>
      </div>
    )
  }

  const activeImage = images[activeImageIndex] ?? images[0]

  return (
    <section className="attraction-gallery" aria-label={`${title} 图片集`}>
      <figure className="attraction-gallery-hero">
        <img src={activeImage.src} alt={activeImage.alt} loading="lazy" />
        <figcaption>
          <p className="mini-label">Photo View</p>
          <strong>{activeImage.caption}</strong>
        </figcaption>
      </figure>

      {images.length > 1 && (
        <div className="attraction-gallery-thumbs" role="tablist" aria-label={`${title} 缩略图切换`}>
          {images.map((image, index) => (
            <button
              key={image.src}
              type="button"
              className={index === activeImageIndex ? 'gallery-thumb is-active' : 'gallery-thumb'}
              onClick={() => setActiveImageIndex(index)}
              aria-label={`切换到 ${title} 图片 ${index + 1}`}
              aria-pressed={index === activeImageIndex}
            >
              <img src={image.src} alt={image.alt} loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </section>
  )
}