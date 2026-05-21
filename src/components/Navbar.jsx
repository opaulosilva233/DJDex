import { useRef, useState } from 'react'

import { BarChart2, Download, Home, Loader2, ListMusic, Moon, PlusCircle, Sun, Upload } from 'lucide-react'
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
	transition: 'background-color 220ms ease, border-color 220ms ease, color 220ms ease, transform 220ms ease, box-shadow 220ms ease',
}

const modalOverlayStyle = {
	position: 'fixed',
	inset: 0,
	zIndex: 1000,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	background: 'rgba(0, 0, 0, 0.55)',
	backdropFilter: 'blur(6px)',
}

const modalStyle = {
	width: 'min(90vw, 420px)',
	borderRadius: '20px',
	padding: '24px',
	background: '#232323',
	border: '1px solid rgba(255, 255, 255, 0.1)',
	boxShadow: '0 24px 80px rgba(0, 0, 0, 0.45)',
	color: '#ffffff',
	display: 'flex',
	flexDirection: 'column',
	gap: '16px',
}

const modalActionsStyle = {
	display: 'flex',
	justifyContent: 'flex-end',
	gap: '12px',
	flexWrap: 'wrap',
}

const modalCancelStyle = {
	...actionButtonStyle,
	width: 'auto',
	paddingInline: '16px',
}

const modalConfirmStyle = {
	...actionButtonStyle,
	width: 'auto',
	paddingInline: '16px',
	background: 'rgba(255, 97, 97, 0.16)',
	border: '1px solid rgba(255, 97, 97, 0.22)',
}

const modalLoadingStyle = {
	display: 'flex',
	alignItems: 'center',
	gap: '12px',
	padding: '14px 16px',
	borderRadius: '14px',
	background: 'rgba(255, 255, 255, 0.05)',
	border: '1px solid rgba(255, 255, 255, 0.08)',
}

export default function Navbar({ generos, djs, festivais, sets, handleImportAllData, darkMode, toggleDarkMode }) {
	const fileInputRef = useRef(null)
	const [isImportModalOpen, setIsImportModalOpen] = useState(false)
	const [pendingImportFile, setPendingImportFile] = useState(null)
	const [isImporting, setIsImporting] = useState(false)
	const isDark = darkMode

	const resolvedSidebarStyle = {
		...sidebarStyle,
		background: isDark ? '#1a1a1a' : '#f8fafc',
		color: isDark ? '#ffffff' : '#0f172a',
		borderRight: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(15, 23, 42, 0.12)',
	}

	const resolvedLinkStyle = {
		...linkStyle,
		color: isDark ? '#ffffff' : '#0f172a',
	}

	const resolvedActionButtonStyle = {
		...actionButtonStyle,
		background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.04)',
		border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(15, 23, 42, 0.12)',
		color: isDark ? '#ffffff' : '#0f172a',
	}

	const resolvedModalStyle = {
		...modalStyle,
		background: isDark ? '#232323' : '#ffffff',
		border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(15, 23, 42, 0.12)',
		color: isDark ? '#ffffff' : '#0f172a',
	}

	const resolvedModalLoadingStyle = {
		...modalLoadingStyle,
		background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.04)',
		border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(15, 23, 42, 0.08)',
	}

	function exportData() {
		const data = JSON.stringify({ generos, djs, festivais, sets }, null, 2)
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

		setPendingImportFile(file)
		setIsImportModalOpen(true)
	}

	function resetImportState() {
		setIsImportModalOpen(false)
		setPendingImportFile(null)
		setIsImporting(false)

		if (fileInputRef.current) {
			fileInputRef.current.value = null
		}
	}

	function cancelImport() {
		resetImportState()
	}

	function confirmImport() {
		if (!pendingImportFile) {
			resetImportState()
			return
		}

		setIsImporting(true)

		const reader = new FileReader()

		reader.onload = (loadEvent) => {
			try {
				const result = loadEvent.target?.result
				const importedData = JSON.parse(result)

				if (Array.isArray(importedData) || importedData) {
					handleImportAllData(importedData)
				}
			} catch {
				// Mantém o comportamento silencioso em caso de ficheiro inválido.
			} finally {
				resetImportState()
			}
		}

		reader.readAsText(pendingImportFile)
	}

	return (
		<nav style={resolvedSidebarStyle}>
			<Link to="/" style={{ ...resolvedLinkStyle, fontSize: '1.15rem', marginBottom: '18px' }}>
				DJDex
			</Link>

			<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
				<Link to="/" style={resolvedLinkStyle}>
					<Home size={18} />
					<span>Início</span>
				</Link>
				<Link to="/lista" style={resolvedLinkStyle}>
					<ListMusic size={18} />
					<span>Lista de DJs</span>
				</Link>
				<Link to="/estatisticas" style={resolvedLinkStyle}>
					<BarChart2 size={18} />
					<span>Estatísticas</span>
				</Link>
				<Link to="/adicionar" style={resolvedLinkStyle}>
					<PlusCircle size={18} />
					<span>Adicionar Set</span>
				</Link>
				<Link to="/djs/adicionar" style={resolvedLinkStyle}>
					<PlusCircle size={18} />
					<span>Adicionar DJ</span>
				</Link>
				<Link to="/generos/adicionar" style={resolvedLinkStyle}>
					<PlusCircle size={18} />
					<span>Adicionar Género</span>
				</Link>
				<Link to="/festivais/adicionar" style={resolvedLinkStyle}>
					<PlusCircle size={18} />
					<span>Adicionar Festival</span>
				</Link>
			</div>

			<div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
				<button type="button" onClick={(event) => toggleDarkMode(event)} style={resolvedActionButtonStyle}>
					<span
						style={{
							display: 'inline-flex',
							transform: darkMode ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.92)',
							transition: 'transform 240ms ease',
						}}
					>
						{darkMode ? <Sun size={18} /> : <Moon size={18} />}
					</span>
					<span>{darkMode ? 'Modo Claro' : 'Modo Escuro'}</span>
				</button>

				<button type="button" onClick={exportData} style={resolvedActionButtonStyle}>
					<Download size={18} />
					<span>Exportar backup</span>
				</button>

				<label style={resolvedActionButtonStyle}>
					<Upload size={18} />
					<span>Importar backup</span>
					<input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={importData} />
				</label>
			</div>

			{isImportModalOpen ? (
				<div style={modalOverlayStyle} role="presentation" onClick={cancelImport}>
					<div style={resolvedModalStyle} role="dialog" aria-modal="true" aria-labelledby="import-backup-title" onClick={(event) => event.stopPropagation()}>
						<div>
							<h2 id="import-backup-title" style={{ margin: 0, fontSize: '1.1rem' }}>
								{isImporting ? 'A importar backup' : 'Confirmar importação'}
							</h2>
							{isImporting ? (
								<div style={{ ...resolvedModalLoadingStyle, marginTop: '12px' }}>
									<Loader2 size={18} className="spin-icon" />
									<span style={{ color: 'rgba(255, 255, 255, 0.82)', lineHeight: 1.5 }}>
										A importar o backup. Aguarda um momento.
									</span>
								</div>
							) : (
								<p style={{ margin: '10px 0 0', color: 'rgba(255, 255, 255, 0.78)', lineHeight: 1.5 }}>
									Atenção: Importar um backup vai substituir todos os teus dados atuais. Tens a certeza que queres continuar?
								</p>
							)}
						</div>

						<div style={modalActionsStyle}>
							<button type="button" onClick={cancelImport} style={modalCancelStyle} disabled={isImporting}>
								Cancelar
							</button>
							<button type="button" onClick={confirmImport} style={modalConfirmStyle} disabled={isImporting}>
								{isImporting ? 'A importar...' : 'Continuar'}
							</button>
						</div>
					</div>
				</div>
			) : null}
		</nav>
	)
}