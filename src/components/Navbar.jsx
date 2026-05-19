import { Link } from 'react-router-dom'

const navbarStyle = {
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'center',
	gap: '16px',
	padding: '18px 24px',
	background: 'rgba(7, 10, 20, 0.92)',
	borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
	backdropFilter: 'blur(14px)',
	position: 'sticky',
	top: 0,
	zIndex: 10,
}

const linkStyle = {
	color: '#e5e7eb',
	textDecoration: 'none',
	fontWeight: 600,
	padding: '10px 14px',
	borderRadius: '999px',
}

export default function Navbar() {
	return (
		<nav style={navbarStyle}>
			<Link to="/" style={{ ...linkStyle, fontSize: '1.05rem' }}>
				DJDex
			</Link>

			<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
				<Link to="/" style={linkStyle}>
					Home
				</Link>
				<Link to="/lista" style={linkStyle}>
					Lista de DJs
				</Link>
				<Link to="/adicionar" style={linkStyle}>
					Adicionar Set
				</Link>
			</div>
		</nav>
	)
}