const BOT_USER_AGENT_STARTS_WITH: string[] = [
	'user-agent',  // User-Agent: User-Agent:
	'Mozilla/3.0 ',
	'Mozilla/2.0 ',
	'Mozilla/1.0 ',
	'Mozilla ',  // missing slash
	' Mozilla/',  // leading space
	'Mozila/', // single 'l'
	'Mozilla/4.0 (compatible; MSIE 6.0; MS Web Services Client Protocol'  // https://twitter.com/NtSetDefault/status/1303643299509567488
];

const BOT_USER_AGENT_CONTAINS: string[] = [
	' (compatible;MSIE ',  // typical typo missing space
	'.0;Windows NT ',  // typical typo missing space
	'loader',  // https://twitter.com/securityonion/status/1522614635152744453?s=20&t=gHyPTSq5A27EqKwrCd9ohg,
	'googlebot',
	'bingbot',
	'yandexbot',
	'duckduckbot',
	'baiduspider',
	'facebookexternalhit',
	'twitterbot',
];

const BOT_USER_AGENTS: string[] = [
	'_',
	'CertUtil URL Agent',  // https://twitter.com/stvemillertime/status/985150675527974912
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:60.0)',  // CobaltStrike Beacon https://unit42.paloaltonetworks.com/tracking-oceanlotus-new-downloader-kerrdown/
	'Mozilla/5.0 (Windows NT 6.3; WOW64; rv:28.0) Gecko/20100101 Firefox/28.0',  // used by APT28 malware https://threatvector.cylance.com/en_us/home/inside-the-apt28-dll-backdoor-blitz.html
	'HTTPS',  // https://twitter.com/stvemillertime/status/1204437531632250880
	'Erbium-UA-4ce7c27cb4be9d32e333bf032c88235a',  // https://www.cyfirma.com/outofband/erbium-stealer-malware-report
	'x',  // Use by Racoon Stealer but could be something else
	'xxx'  // Use by Racoon Stealer but could be something else
];

const _userAgent: string = window.navigator.userAgent;

export function isBot(): boolean {
	return (
		doesUserAgentContainBotMetadata() ||
		doesUserAgentStartsWithBotMetadata() ||
		doesUserAgentMatchesWithBotUserAgent()
	);
}

function doesUserAgentContainBotMetadata(): boolean {
	return BOT_USER_AGENT_CONTAINS.some((info: string) => _userAgent.includes(info));
}

function doesUserAgentStartsWithBotMetadata(): boolean {
	return BOT_USER_AGENT_STARTS_WITH.some((info: string) => _userAgent.startsWith(info));
}

function doesUserAgentMatchesWithBotUserAgent(): boolean {
	return BOT_USER_AGENTS.some((agent: string): boolean => _userAgent === agent)
}
