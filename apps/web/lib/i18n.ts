export const localeOptions = [
	{ code: 'en', label: 'English' },
	{ code: 'es', label: 'Espanol' },
	{ code: 'fr', label: 'Francais' },
	{ code: 'de', label: 'Deutsch' },
	{ code: 'it', label: 'Italiano' },
	{ code: 'pt', label: 'Portugues' },
	{ code: 'nl', label: 'Nederlands' },
	{ code: 'pl', label: 'Polski' },
	{ code: 'cs', label: 'Cestina' },
	{ code: 'sv', label: 'Svenska' },
	{ code: 'da', label: 'Dansk' },
	{ code: 'fi', label: 'Suomi' },
	{ code: 'no', label: 'Norsk' },
	{ code: 'ro', label: 'Romana' },
	{ code: 'hu', label: 'Magyar' },
	{ code: 'tr', label: 'Turkce' },
	{ code: 'uk', label: 'Ukrainska' },
	{ code: 'ru', label: 'Russkiy' },
	{ code: 'ar', label: 'العربية' },
	{ code: 'he', label: 'עברית' },
	{ code: 'hi', label: 'Hindi' },
	{ code: 'bn', label: 'Bangla' },
	{ code: 'th', label: 'Thai' },
	{ code: 'vi', label: 'Tieng Viet' },
	{ code: 'id', label: 'Bahasa Indonesia' },
	{ code: 'ms', label: 'Bahasa Melayu' },
	{ code: 'ja', label: '日本語' },
	{ code: 'ko', label: '한국어' },
	{ code: 'zh', label: '中文' }
] as const;

export type LocaleCode = (typeof localeOptions)[number]['code'];

export const defaultLocale: LocaleCode = 'en';
export const localeStorageKey = 'fieldops_locale';

type Messages = Record<string, string>;

export const messages: Partial<Record<LocaleCode, Messages>> = {
	en: {
		'brand.kicker': 'Field Service OS',
		'brand.copy': 'Operational control for teams in motion.',
		'status.live': 'Live Ops',
		'status.route': 'Route',
		'status.updated': 'Updated',
		'search.placeholder': 'Search pages...',
		'language.label': 'Language',
		'user.commander': 'Commander',
		'user.profile': 'Profile',
		'user.preferences': 'Preferences',
		'user.signout': 'Sign out',
		'nav.marketing': 'Marketing',
		'nav.buy': 'Buy',
		'nav.purchases': 'Purchases',
		'nav.dashboard': 'Dashboard',
		'nav.projects': 'Projects',
		'nav.meetings': 'Meetings',
		'nav.assets': 'Assets',
		'nav.scanIn': 'Scan In',
		'nav.workOrders': 'Work Orders',
		'nav.training': 'Training',
		'nav.inventory': 'Inventory',
		'nav.forecasting': 'Forecasting',
		'nav.amara': 'Amara',
		'nav.customerPortal': 'Customer Portal'
	},
	es: {
		'brand.kicker': 'SO de Servicio en Campo',
		'brand.copy': 'Control operativo para equipos en movimiento.',
		'status.live': 'Operaciones en Vivo',
		'status.route': 'Ruta',
		'status.updated': 'Actualizado',
		'search.placeholder': 'Buscar paginas...',
		'language.label': 'Idioma',
		'user.commander': 'Comandante',
		'user.profile': 'Perfil',
		'user.preferences': 'Preferencias',
		'user.signout': 'Cerrar sesion'
	},
	fr: {
		'brand.kicker': 'OS Service Terrain',
		'brand.copy': 'Controle operationnel pour les equipes mobiles.',
		'status.live': 'Ops en Direct',
		'status.route': 'Route',
		'status.updated': 'Mis a jour',
		'search.placeholder': 'Rechercher des pages...',
		'language.label': 'Langue',
		'user.commander': 'Commandant',
		'user.profile': 'Profil',
		'user.preferences': 'Preferences',
		'user.signout': 'Se deconnecter'
	},
	de: {
		'brand.kicker': 'Field Service OS',
		'brand.copy': 'Betriebssteuerung fur Teams in Bewegung.',
		'status.live': 'Live-Betrieb',
		'status.route': 'Pfad',
		'status.updated': 'Aktualisiert',
		'search.placeholder': 'Seiten suchen...',
		'language.label': 'Sprache',
		'user.commander': 'Leiter',
		'user.profile': 'Profil',
		'user.preferences': 'Einstellungen',
		'user.signout': 'Abmelden'
	},
	pt: {
		'brand.kicker': 'SO de Campo',
		'brand.copy': 'Controle operacional para equipes em movimento.',
		'status.live': 'Operacao ao Vivo',
		'status.route': 'Rota',
		'status.updated': 'Atualizado',
		'search.placeholder': 'Pesquisar paginas...',
		'language.label': 'Idioma',
		'user.commander': 'Comandante',
		'user.profile': 'Perfil',
		'user.preferences': 'Preferencias',
		'user.signout': 'Sair'
	}
};

export function translate(locale: LocaleCode, key: string): string {
	return messages[locale]?.[key] ?? messages[defaultLocale]?.[key] ?? key;
}
