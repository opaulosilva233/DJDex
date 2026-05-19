import { useState } from 'react'

const initialFormState = {
	dj: '',
	festival: '',
	local: '',
	data: '',
	hora: '',
	avaliacao: '',
}

export default function AddSetForm({ onAddSet }) {
	const [formData, setFormData] = useState(initialFormState)

	function handleChange(event) {
		const { name, value } = event.target
		setFormData((currentFormData) => ({
			...currentFormData,
			[name]: value,
		}))
	}

	function handleSubmit(event) {
		event.preventDefault()

		const novoSet = {
			id: crypto.randomUUID(),
			nome: formData.dj,
			festival: formData.festival,
			local: formData.local,
			data: formData.data,
			hora: formData.hora,
			avaliacao: formData.avaliacao === '' ? null : Number(formData.avaliacao),
		}

		onAddSet(novoSet)
		setFormData(initialFormState)
	}

	const fieldStyle = {
		padding: '10px 12px',
		borderRadius: '10px',
		border: '1px solid #cfcfcf',
		fontSize: '1rem',
		fontFamily: 'inherit',
	}

	return (
		<form
			onSubmit={handleSubmit}
			style={{
				display: 'grid',
				gap: '12px',
				padding: '16px',
				marginBottom: '24px',
				borderRadius: '16px',
				border: '1px solid #e3e3e3',
				background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
				boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
				maxWidth: '720px',
			}}
		>
			<h2 style={{ margin: 0 }}>Adicionar novo set</h2>
			<div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
				<input name="dj" type="text" placeholder="DJ" value={formData.dj} onChange={handleChange} style={fieldStyle} required />
				<input name="festival" type="text" placeholder="Festival" value={formData.festival} onChange={handleChange} style={fieldStyle} required />
				<input name="local" type="text" placeholder="Local" value={formData.local} onChange={handleChange} style={fieldStyle} required />
				<input name="data" type="date" placeholder="Data" value={formData.data} onChange={handleChange} style={fieldStyle} required />
				<input name="hora" type="time" placeholder="Hora" value={formData.hora} onChange={handleChange} style={fieldStyle} required />
				<input name="avaliacao" type="number" min="0" max="10" placeholder="Avaliação" value={formData.avaliacao} onChange={handleChange} style={fieldStyle} required />
			</div>
			<button
				type="submit"
				style={{
					justifySelf: 'start',
					padding: '10px 16px',
					borderRadius: '999px',
					border: 'none',
					background: '#111827',
					color: '#fff',
					fontWeight: 600,
					cursor: 'pointer',
				}}
			>
				Guardar set
			</button>
		</form>
	)
}