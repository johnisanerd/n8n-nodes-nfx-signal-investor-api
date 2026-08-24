import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
	NodeApiError,
	NodeConnectionTypes,
} from 'n8n-workflow';
import { properties } from './ApifyNfxSignalInvestor.properties';
import { runActor } from './helpers/executeActor';

// SNIPPET 1: Make sure the constants are correct
export const ACTOR_ID = 'YMyUbcw8eLkaoK3Ae' as string;

export const PACKAGE_NAME = 'n8n-nodes-nfx-signal-investor-api' as string;
export const CLASS_NAME = 'ApifyNfxSignalInvestor' as string;
export const ClassNameCamel = CLASS_NAME.charAt(0).toLowerCase() + CLASS_NAME.slice(1); // make the first letter lowercase for name fields

export const X_PLATFORM_HEADER_ID = 'n8n' as string;
export const X_PLATFORM_APP_HEADER_ID = 'nfx-signal-investor-app' as string;

export const DISPLAY_NAME = 'NFX Signal Investors' as string;
export const DESCRIPTION =
	'Get venture investors, VC firms, and investor lists from Signal by NFX with check sizes' as string;

export class ApifyNfxSignalInvestor implements INodeType {
	description: INodeTypeDescription = {
		displayName: DISPLAY_NAME,
		name: ClassNameCamel,

		// SNIPPET 2: Adjust the icon of your app
		icon: 'file:logo.svg',
		group: ['transform'],
		// Mismatched version and defaultVersion as a minor hack to hide "Custom API Call" resource
		version: [1],
		defaultVersion: 1,

		// SNIPPET 3: Adjust the subtitle for your Actor app.
		subtitle: 'Get Investors',

		// SNIPPET 4: Make sure the description is not too large, 1 sentence should be ideal.
		description: DESCRIPTION,
		defaults: {
			name: DISPLAY_NAME,
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				displayName: 'Apify API key connection',
				name: 'apifyApi',
				required: false,
				displayOptions: {
					show: {
						authentication: ['apifyApi'],
					},
				},
			},
			{
				displayName: 'Apify OAuth2 connection',
				name: 'apifyOAuth2Api',
				required: false,
				displayOptions: {
					show: {
						authentication: ['apifyOAuth2Api'],
					},
				},
			},
		],

		properties,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const data = await runActor.call(this, i);
				for (const item of data) {
					returnData.push({ ...item, pairedItem: { item: i } });
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
