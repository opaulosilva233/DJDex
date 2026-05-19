import { useRef } from 'react'

import { BarChart2, Download, Home, ListMusic, PlusCircle, Upload } from 'lucide-react'
import { Link } from 'react-router-dom'

const sidebarStyle = {
	height: '100vh',
	width: '250px',
	display: 'flex',
	flexDirection: 'column',
	padding: '20px',
	background: '#1a1a1a',
	color: '#ffffff',
	borderRight: '1px solid rgba(255, 255, 255, 0.08)',
	flexShrink: 0,
}

const linkStyle = {
	color: '#ffffff',
	textDecoration: 'none',
	fontWeight: 600,
	padding: '12px 14px',
	borderRadius: '12px',
	display: 'flex',
	alignItems: 'center',
	gap: '12px',
	transition: 'background-color 160ms ease, transform 160ms ease',
}


const actionButtonStyle = {
	...linkStyle,
	justifyContent: 'center',
	background: 'rgba(255, 255, 255, 0.06)',
	border: '1px solid rgba(255, 255, 255, 0.08)',
	cursor: 'pointer',
	width: '100%',
}

export default function Navbar({ sets, handleImportData }) {
	const fileInputRef = useRef(null)

	function exportData() {
		const data = JSON.stringify(sets, null, 2)
		const blob = new Blob([data], { type: 'application/json' })
		const url = URL.createObjectURL(blob)
		const link = document.createElement('a')

		link.href = url
		link.download = 'ravedex-backup.json'
		document.body.appendChild(link)
		link.click()
		link.remove()
		URL.revokeObjectURL(url)
	}

	function importData(event) {
		const file = event.target.files?.[0]

		if (!file) {
			return
		}

		const reader = new FileReader()

		reader.onload = (loadEvent) => {
			try {
				const result = loadEvent.target?.result
				const importedSets = JSON.parse(result)

				if (Array.isArray(importedSets)) {
					handleImportData(importedSets)
				}
			} catch {
				// Mantém o comportamento silencioso em caso de ficheiro inválido.
			}
		}

		reader.readAsText(file)
		event.target.value = ''
	}

	return (
		<nav style={sidebarStyle}>
			<Link to="/" style={{ ...linkStyle, fontSize: '1.15rem', marginBottom: '18px' }}>
				DJDex
			</Link>

			<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
				<Link to="/" style={linkStyle}>
					<Home size={18} />
					<span>Início</span>
				</Link>
				<Link to="/lista" style={linkStyle}>
					<ListMusic size={18} />
					<span>Lista de DJs</span>
				</Link>
				<Link to="/estatisticas" style={linkStyle}>
					<BarChart2 size={18} />
					<span>Estatísticas</span>
				</Link>
				<Link to="/adicionar" style={linkStyle}>
					<PlusCircle size={18} />
					<span>Adicionar Set</span>
				</Link>
			</div>

			<div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
				<button type="button" onClick={exportData} style={actionButtonStyle}>
					<Download size={18} />
					<span>Exportar backup</span>
				</button>

				<label style={actionButtonStyle}>
					<Upload size={18} />
					<span>Importar backup</span>
					<input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={importData} />
				</label>
			</div>
		</nav>
	)
}