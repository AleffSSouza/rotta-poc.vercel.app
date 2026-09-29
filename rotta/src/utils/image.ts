/** Foto de exemplo (gôndola com espaços vazios) para a demonstração, sem depender de câmera. */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 240"><rect width="360" height="240" fill="#e9edf3"/><rect x="14" y="20" width="332" height="200" rx="6" fill="#f8fafc" stroke="#cfd6e2"/><g fill="#cfd6e2"><rect x="14" y="88" width="332" height="6"/><rect x="14" y="158" width="332" height="6"/></g><g fill="#3b4ee6"><rect x="28" y="44" width="34" height="44" rx="3"/><rect x="68" y="44" width="34" height="44" rx="3"/><rect x="108" y="44" width="34" height="44" rx="3"/><rect x="226" y="44" width="34" height="44" rx="3"/><rect x="266" y="44" width="34" height="44" rx="3"/><rect x="306" y="44" width="30" height="44" rx="3"/></g><g fill="#3b4ee6"><rect x="28" y="114" width="34" height="44" rx="3"/><rect x="68" y="114" width="34" height="44" rx="3"/></g><g fill="#e8590c"><rect x="28" y="184" width="34" height="34" rx="3"/><rect x="68" y="184" width="34" height="34" rx="3"/><rect x="108" y="184" width="34" height="34" rx="3"/><rect x="148" y="184" width="34" height="34" rx="3"/><rect x="188" y="184" width="34" height="34" rx="3"/></g><text x="180" y="138" font-family="sans-serif" font-size="12" font-weight="700" fill="#d93a3a" text-anchor="middle">espaço vazio</text></svg>`

export const SAMPLE_PHOTO = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`

/** Reduz a foto escolhida para uma miniatura leve, que cabe no localStorage. */
export function fileToThumbnail(file: File, maxSize = 360): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Arquivo de imagem inválido.'))
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.6))
      }
      img.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}
