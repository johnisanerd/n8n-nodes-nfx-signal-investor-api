import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';

/**
 * Build the Apify Actor input from node parameters.
 * Only the real Actor inputs are sent; the Output / Fields parameters shape the
 * data we return, they are not part of the Actor input.
 */
export function buildActorInput(
	context: IExecuteFunctions,
	itemIndex: number,
	defaultInput: Record<string, any>,
): Record<string, any> {
	const input: Record<string, any> = { ...defaultInput };

	const mode = context.getNodeParameter('mode', itemIndex, 'investors') as string;
	const listSlugs = (context.getNodeParameter('listSlugs', itemIndex, []) as string[]) ?? [];
	const stage = (context.getNodeParameter('stage', itemIndex, '') as string).trim();
	const locationId = (context.getNodeParameter('locationId', itemIndex, '') as string).trim();
	const pageSize = context.getNodeParameter('pageSize', itemIndex, 50) as number;
	const includeFirms = context.getNodeParameter('includeFirms', itemIndex, false) as boolean;
	const enrichWithLinkedIn = context.getNodeParameter('enrichWithLinkedIn', itemIndex, false) as boolean;
	const enrichWithCrunchbase = context.getNodeParameter(
		'enrichWithCrunchbase',
		itemIndex,
		false,
	) as boolean;

	input.mode = mode;

	const cleanSlugs = listSlugs.map((s) => (s ?? '').trim()).filter((s) => s.length > 0);
	if (cleanSlugs.length) input.listSlugs = cleanSlugs;

	if (stage) input.stage = stage;
	if (locationId) input.locationId = locationId;
	if (pageSize) input.pageSize = pageSize;
	if (includeFirms) input.includeFirms = true;
	if (enrichWithLinkedIn) input.enrichWithLinkedIn = true;
	if (enrichWithCrunchbase) input.enrichWithCrunchbase = true;

	input.maxItems = context.getNodeParameter('maxItems', itemIndex, 25);

	return input;
}

const resourceProperties: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Investor',
				value: 'investor',
			},
		],
		default: 'investor',
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['investor'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get investors firms or lists from signal by nfx',
				description: 'Return investors, firms, or the investor list catalog',
			},
		],
		default: 'get',
	},
];

const inputProperties: INodeProperties[] = [
	{
		displayName: 'Mode',
		name: 'mode',
		type: 'options',
		options: [
			{ name: 'Firms', value: 'firms', description: 'The venture firms attached to the given lists' },
			{
				name: 'Investors',
				value: 'investors',
				description: 'Investors on the given lists, with check sizes',
			},
			{
				name: 'Lists',
				value: 'lists',
				description: 'The catalog of public investor lists, use it to discover slugs',
			},
		],
		default: 'investors',
		description: 'What to return',
	},
	{
		displayName: 'List Slugs',
		name: 'listSlugs',
		type: 'string',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				mode: ['investors', 'firms'],
			},
		},
		placeholder: 'fintech-seed',
		default: [],
		description:
			'Investor list slugs to pull, for example fintech-seed, ai-seed, saas-seed, san-francisco-bay-area, new-york-city, or london. Run Lists mode first to discover them.',
	},
	{
		displayName: 'Maximum Items',
		name: 'maxItems',
		type: 'number',
		default: 25,
		description: 'Maximum rows to return. Use 0 for no limit.',
	},
	{
		displayName: 'Page Size',
		name: 'pageSize',
		type: 'number',
		displayOptions: {
			show: {
				mode: ['investors'],
			},
		},
		default: 50,
		description: 'How many investors to request per page',
	},
	{
		displayName: 'Also Emit Firm Rows',
		name: 'includeFirms',
		type: 'boolean',
		displayOptions: {
			show: {
				mode: ['investors'],
			},
		},
		default: false,
		description: 'Whether to also emit one deduplicated row per firm',
	},
	{
		displayName: 'Stage',
		name: 'stage',
		type: 'options',
		displayOptions: {
			show: {
				mode: ['lists'],
			},
		},
		options: [
			{ name: 'Any', value: '' },
			{ name: 'Pre-Seed', value: 'pre_seed' },
			{ name: 'Seed', value: 'seed' },
			{ name: 'Series A', value: 'series_a' },
			{ name: 'Series B', value: 'series_b' },
		],
		default: '',
		description: 'Filter the list catalog by investment stage',
	},
	{
		displayName: 'Location ID',
		name: 'locationId',
		type: 'string',
		displayOptions: {
			show: {
				mode: ['lists'],
			},
		},
		placeholder: '',
		default: '',
		description: 'Optional location tag ID to filter the list catalog',
	},
	{
		displayName: 'Enrich Firms With LinkedIn',
		name: 'enrichWithLinkedIn',
		type: 'boolean',
		default: false,
		description:
			'Whether to add LinkedIn company data to each firm. Adds a per firm charge and extra run time.',
	},
	{
		displayName: 'Enrich Firms With Crunchbase',
		name: 'enrichWithCrunchbase',
		type: 'boolean',
		default: false,
		description:
			'Whether to add Crunchbase data to each firm. Adds a per firm charge and extra run time.',
	},
];

const outputProperties: INodeProperties[] = [
	{
		displayName: 'Output',
		name: 'output',
		type: 'options',
		options: [
			{ name: 'Raw', value: 'raw', description: 'Every field the Actor returns' },
			{ name: 'Selected Fields', value: 'selected', description: 'Only the fields you pick' },
			{ name: 'Simplified', value: 'simplified', description: 'A small, agent friendly subset' },
		],
		default: 'simplified',
		description: 'How much of each row to return',
	},
	{
		displayName: 'Fields',
		name: 'fields',
		type: 'multiOptions',
		displayOptions: {
			show: {
				output: ['selected'],
			},
		},
		options: [
			{ name: 'Crunchbase Employees', value: 'crunchbaseEmployees' },
			{ name: 'Crunchbase Rank', value: 'crunchbaseRank' },
			{ name: 'Crunchbase Status', value: 'crunchbaseStatus' },
			{ name: 'Crunchbase URL', value: 'crunchbaseUrl' },
			{ name: 'Firm Name', value: 'firmName' },
			{ name: 'Firm URL', value: 'firmUrl' },
			{ name: 'Headshot URL', value: 'headshotUrl' },
			{ name: 'Investment Locations', value: 'investmentLocations' },
			{ name: 'Investor Count', value: 'investorCount' },
			{ name: 'LinkedIn Followers', value: 'linkedinFollowers' },
			{ name: 'LinkedIn Industry', value: 'linkedinIndustry' },
			{ name: 'LinkedIn Size', value: 'linkedinSize' },
			{ name: 'LinkedIn URL', value: 'linkedinUrl' },
			{ name: 'List Memberships', value: 'listMemberships' },
			{ name: 'List URL', value: 'listUrl' },
			{ name: 'Max Investment', value: 'maxInvestment' },
			{ name: 'Min Investment', value: 'minInvestment' },
			{ name: 'Name', value: 'name' },
			{ name: 'Person URL', value: 'personUrl' },
			{ name: 'Position', value: 'position' },
			{ name: 'Result Type', value: 'result_type' },
			{ name: 'Slug', value: 'slug' },
			{ name: 'Source List Slug', value: 'sourceListSlug' },
			{ name: 'Source List Stage', value: 'sourceListStage' },
			{ name: 'Source List Vertical', value: 'sourceListVertical' },
			{ name: 'Stage', value: 'stage' },
			{ name: 'Target Investment', value: 'targetInvestment' },
			{ name: 'Vertical', value: 'vertical' },
		],
		default: [],
		description: 'Which fields to keep when Output is set to Selected Fields',
	},
];

const authenticationProperties: INodeProperties[] = [
	{
		displayName: 'Authentication',
		name: 'authentication',
		type: 'options',
		options: [
			{
				name: 'API Key',
				value: 'apifyApi',
			},
			{
				name: 'OAuth2',
				value: 'apifyOAuth2Api',
			},
		],
		default: 'apifyApi',
		description: 'Choose which authentication method to use',
	},
];

export const properties: INodeProperties[] = [
	...authenticationProperties,
	...resourceProperties,
	...inputProperties,
	...outputProperties,
];
