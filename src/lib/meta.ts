export function setMeta(property: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function setPageTitle(title: string, siteName = 'Dấu Ấn') {
  document.title = title === siteName ? siteName : `${title} — ${siteName}`
  setMeta('og:title', document.title)
}
