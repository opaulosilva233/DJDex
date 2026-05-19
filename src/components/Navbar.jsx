import { BarChart2, Home, ListMusic, PlusCircle } from 'lucide-react'
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

export default function Navbar() {
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
		</nav>
	)
}