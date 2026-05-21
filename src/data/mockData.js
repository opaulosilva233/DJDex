export const djs = [
	{
		id: crypto.randomUUID(),
		nome: 'Sefa',
		genero: 'Hardstyle',
		biografia: 'Referência do hardstyle melódico, conhecido por sets intensos e emotivos.',
		imagem: 'sefa.jpg',
	},
	{
		id: crypto.randomUUID(),
		nome: 'Rebelion',
		genero: 'Raw Hardstyle',
		biografia: 'Dupla neerlandesa com energia crua e drops pesados para grandes palcos.',
		imagem: 'rebelion.jpg',
	},
]

export const festivais = [
	{
		id: crypto.randomUUID(),
		nome: 'Neon Pulse',
		local: 'Lisboa',
		ano: 2026,
		imagem: 'neon-pulse.png',
	},
	{
		id: crypto.randomUUID(),
		nome: 'Rift Open Air',
		local: 'Porto',
		ano: 2026,
		imagem: 'rift-open-air.png',
	},
]

export const sets = [
	{
		id: crypto.randomUUID(),
		djId: djs[0].id,
		festivalId: festivais[0].id,
		data: '2026-05-24',
		hora: '22:30',
		avaliacao: 9.4,
	},
	{
		id: crypto.randomUUID(),
		djId: djs[1].id,
		festivalId: festivais[1].id,
		data: '2026-05-25',
		hora: '01:00',
		avaliacao: 8.8,
	},
	{
		id: crypto.randomUUID(),
		djId: djs[0].id,
		festivalId: festivais[1].id,
		data: '2026-05-26',
		hora: '19:45',
		avaliacao: 9.1,
	},
	{
		id: crypto.randomUUID(),
		djId: djs[1].id,
		festivalId: festivais[0].id,
		data: '2026-05-27',
		hora: '23:15',
		avaliacao: 8.5,
	},
]