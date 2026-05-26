import { useRef, useState } from 'react'

import { Compass, Download, Home, ListMusic, Loader2, Moon, Sun, Tag, Upload, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const sidebarStyle = {
	height: '100vh',
	width: '250px',
	display: 'flex',
	flexDirection: 'column',
	padding: '20px',
	background: '#1a1a1a',
	color: '#ffffff',
	flexShrink: 0,
}

const sectionTitleStyle = 'px-4 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500'

const navIconStyle = 'shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-1'

function getNavLinkClassName(isActive, isDark) {
	return [
		'group flex items-center gap-3 rounded-xl border-l-4 py-3 pr-4 text-sm transition-all duration-200',
		isActive
			? isDark
				? 'border-purple-500 bg-purple-600/10 pl-3 font-medium text-purple-400'
				: 'border-purple-500 bg-purple-500/10 pl-3 font-medium text-purple-700'
			: isDark
				? 'border-transparent pl-4 text-slate-400 hover:bg-slate-800/40 hover:text-white'
				: 'border-transparent pl-4 text-slate-500 hover:bg-slate-100 hover:text-slate-900',
	].join(' ')
}

function getActionButtonClassName(isDark, extraClassName = '') {
	const toneClassName = isDark
		? 'border-white/10 bg-white/5 text-white hover:bg-white/10 hover:shadow-[0_12px_28px_rgba(0,0,0,0.24)]'
		: 'border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]'

	return [
		'group flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50',
		toneClassName,
		extraClassName,
	].join(' ')
}

function getSecondaryActionClassName(isDark) {
	return [
		'flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors',
		isDark
			? 'text-slate-500 hover:bg-slate-800/30 hover:text-slate-300'
			: 'text-slate-500 hover:bg-slate-200/70 hover:text-slate-700',
	].join(' ')
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

const modalButtonBaseStyle = {
	width: 'auto',
	paddingInline: '16px',
}

const modalCancelStyle = {
	...modalButtonBaseStyle,
}

const modalConfirmStyle = {
	...modalButtonBaseStyle,
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
	}

	const modalActionButtonClassName = getActionButtonClassName(isDark, 'hover:brightness-110')
	const secondaryActionClassName = getSecondaryActionClassName(isDark)

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

	function openImportPicker() {
		fileInputRef.current?.click()
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
			<div style={{ marginBottom: '20px', padding: '0 4px' }}>
				<div style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '0.04em' }}>DJDex</div>
				<p style={{ margin: '6px 0 0', color: isDark ? 'rgba(148, 163, 184, 0.9)' : 'rgba(71, 85, 105, 0.9)', fontSize: '0.82rem' }}>
					Painel de gestão musical
				</p>
			</div>

			<div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
				<section>
					<h2 className={sectionTitleStyle}>GERAL</h2>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
						<NavLink to="/" end className={({ isActive }) => getNavLinkClassName(isActive, isDark)}>
							<Home size={18} className={navIconStyle} />
							<span>Início</span>
						</NavLink>
						<NavLink to="/lista" className={({ isActive }) => getNavLinkClassName(isActive, isDark)}>
							<ListMusic size={18} className={navIconStyle} />
							<span>Histórico de Sets</span>
						</NavLink>
					</div>
				</section>

				<section>
					<h2 className={sectionTitleStyle}>BIBLIOTECA</h2>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
						<NavLink to="/djs" className={({ isActive }) => getNavLinkClassName(isActive, isDark)}>
							<User size={18} className={navIconStyle} />
							<span>DJs</span>
						</NavLink>
						<NavLink to="/festivais" className={({ isActive }) => getNavLinkClassName(isActive, isDark)}>
							<Compass size={18} className={navIconStyle} />
							<span>Festivais</span>
						</NavLink>
						<NavLink to="/generos" className={({ isActive }) => getNavLinkClassName(isActive, isDark)}>
							<Tag size={18} className={navIconStyle} />
							<span>Géneros</span>
						</NavLink>
					</div>
				</section>

				<section style={{ marginTop: 'auto' }}>
					<h2 className={sectionTitleStyle}>SISTEMA</h2>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
								<button
									type="button"
									onClick={(event) => toggleDarkMode(event)}
									aria-label={darkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
									aria-pressed={darkMode}
									className={[
										'group w-full h-11 rounded-xl relative flex items-center justify-between px-3 cursor-pointer select-none overflow-hidden transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50',
										darkMode
											? 'bg-gradient-to-r from-purple-950/40 to-indigo-900/40 border border-purple-500/20 text-slate-100 shadow-[0_14px_34px_rgba(15,23,42,0.22)]'
											: 'bg-gradient-to-r from-amber-500/20 to-orange-600/10 border border-amber-500/30 text-slate-900 shadow-[0_14px_34px_rgba(251,146,60,0.10)]',
									].join(' ')}
								>
									<span
										className={[
											'relative z-10 transition-all duration-300',
											darkMode
												? 'text-slate-600'
												: 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]',
										].join(' ')}
									>
										<Sun size={16} />
									</span>

									<span className="pointer-events-none absolute left-1/2 z-0 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest text-slate-500/50">
										CROSSFADE
									</span>

									<span
										className={[
											'relative z-10 transition-all duration-300',
											darkMode
												? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.6)]'
												: 'text-slate-400',
										].join(' ')}
									>
										<Moon size={16} />
									</span>

									<div
										className={[
											'absolute top-1 bottom-1 w-[calc(50%-8px)] rounded-lg transition-all duration-300 ease-out shadow-md flex items-center justify-center',
											darkMode ? 'left-[calc(50%+4px)] bg-slate-800 border border-purple-500/40' : 'left-1 bg-white border border-amber-200',
										].join(' ')}
									>
										<div className="flex h-3 w-full items-center justify-center gap-0.5 opacity-60">
											<span className="h-2.5 w-px rounded-full bg-slate-400/70" />
											<span className="h-2.5 w-px rounded-full bg-slate-400/70" />
											<span className="h-2.5 w-px rounded-full bg-slate-400/70" />
										</div>
									</div>
								</button>

						<div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-200/70 pt-4 dark:border-slate-800/60">
							<button type="button" onClick={exportData} className={secondaryActionClassName}>
								<Download size={14} className="shrink-0" />
								<span>Exportar</span>
							</button>

							<button type="button" onClick={openImportPicker} className={secondaryActionClassName}>
								<Upload size={14} className="shrink-0" />
								<span>Importar</span>
							</button>
							<input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={importData} />
						</div>
					</div>
				</section>
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
									<Loader2 size={18} className="animate-spin" />
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
							<button type="button" onClick={cancelImport} style={modalCancelStyle} disabled={isImporting} className={modalActionButtonClassName}>
								Cancelar
							</button>
							<button type="button" onClick={confirmImport} style={modalConfirmStyle} disabled={isImporting} className={modalActionButtonClassName}>
								{isImporting ? 'A importar...' : 'Continuar'}
							</button>
						</div>
					</div>
				</div>
			) : null}
		</nav>
	)
}