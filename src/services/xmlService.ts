// Simple XML parsing helper for AFIP-like documents. Uses DOMParser available in browser.

export function parseXmlString(xml: string): any {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xml, 'application/xml')
    // Convert to a simple object (shallow)
    const obj: any = {}
    const walk = (node: any, out: any) => {
      node.childNodes && Array.from(node.childNodes).forEach((c: any) => {
        if (c.nodeType === 3) return
        const name = c.nodeName
        const text = c.textContent && c.textContent.trim()
        if (text && c.childNodes.length === 1) out[name] = text
        else {
          out[name] = out[name] || {}
          walk(c, out[name])
        }
      })
    }
    walk(doc.documentElement, obj)
    return obj
  } catch (e) {
    return null
  }
}

export default { parseXmlString }
