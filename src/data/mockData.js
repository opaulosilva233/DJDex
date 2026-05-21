export const generos = [
	{ id: 'g1', nome: 'Hardstyle' },
	{ id: 'g2', nome: 'Rawstyle' },
	{ id: 'g3', nome: 'Hardcore' },
	{ id: 'g4', nome: 'Frenchcore' },
]

export const djs = [
	{
		id: 'd1',
		nome: 'Sefa',
		biografia: 'Referência do hardstyle melódico, conhecido por sets intensos e emotivos.',
		imagem: '',
		generoIds: ['g1', 'g4'],
	},
	{
		id: 'd2',
		nome: 'Rebelion',
		biografia: 'Dupla neerlandesa com energia crua e drops pesados para grandes palcos.',
		imagem: '',
		generoIds: ['g2'],
	},
]

export const festivais = [
	{
		id: 'f1',
		nome: 'Neon Pulse',
		local: 'Lisboa',
		ano: 2026,
		imagem: '',
	},
	{
		id: 'f2',
		nome: 'Rift Open Air',
		local: 'Porto',
		ano: 2026,
		imagem: '',
	},
]

export const sets = [
	{
		id: 's1',
		djId: 'd1',
		festivalId: 'f1',
		data: '2026-05-24',
		hora: '22:30',
		avaliacao: 9.4,
	},
	{
		id: 's2',
		djId: 'd2',
		festivalId: 'f2',
		data: '2026-05-25',
		hora: '01:00',
		avaliacao: 8.8,
	},
	{
		id: 's3',
		djId: 'd1',
		festivalId: 'f2',
		data: '2026-05-26',
		hora: '19:45',
		avaliacao: 9.1,
	},
	{
		id: 's4',
		djId: 'd2',
		festivalId: 'f1',
		data: '2026-05-27',
		hora: '23:15',
		avaliacao: 8.5,
	},
]