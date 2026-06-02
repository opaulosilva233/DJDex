export function compressImage(file, maxWidth = 400) {
	return new Promise((resolve, reject) => {
		if (!file) {
			reject(new Error('Ficheiro de imagem inválido.'))
			return
		}

		const reader = new FileReader()

		reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'))
		reader.onload = () => {
			const image = new Image()

			image.onerror = () => reject(new Error('Não foi possível carregar a imagem.'))
			image.onload = () => {
				const scale = Math.min(1, maxWidth / image.width)
				const canvas = document.createElement('canvas')
				canvas.width = Math.round(image.width * scale)
				canvas.height = Math.round(image.height * scale)

				const context = canvas.getContext('2d')

				if (!context) {
					reject(new Error('Não foi possível criar o contexto do canvas.'))
					return
				}

				context.drawImage(image, 0, 0, canvas.width, canvas.height)
				resolve(canvas.toDataURL('image/jpeg', 0.7))
			}

			image.src = reader.result
		}

		reader.readAsDataURL(file)
	})
}
