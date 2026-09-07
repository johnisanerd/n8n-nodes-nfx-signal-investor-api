# n8n-nodes-nfx-signal-investor-api

An n8n community node for the **NFX Signal Investor API** on [Apify](https://apify.com?fpr=9n7kx3). It returns venture investors, VC firms, and the investor list catalog from Signal by NFX as structured JSON, including the check size each investor writes.

Not affiliated with, endorsed by, or connected to NFX. It reads the public investor lists.

## Install

In n8n: **Settings → Community Nodes → Install**, then enter:

```
n8n-nodes-nfx-signal-investor-api
```

Accept the risk prompt and restart if asked. Self-hosted n8n only.

## Credentials

The node uses your Apify credential, either an API key or OAuth2.

1. Get a free Apify account: https://apify.com?fpr=9n7kx3
2. Copy your token from https://console.apify.com/settings/integrations
3. In n8n, add an **Apify API** credential and paste the token.

## Parameters

| Field | Type | Default | Notes |
|---|---|---|---|
| Mode | options | Investors | Investors, Firms, or Lists |
| List Slugs | string list | empty | Required for Investors and Firms. Run Lists mode first to discover slugs. |
| Maximum Items | number | 25 | 0 means no limit |
| Page Size | number | 50 | Investors mode only |
| Also Emit Firm Rows | boolean | false | Investors mode only |
| Stage | options | Any | Lists mode filter: Pre-Seed, Seed, Series A, Series B |
| Location ID | string | empty | Lists mode filter |
| Enrich Firms With LinkedIn | boolean | false | Adds a per firm charge and run time |
| Enrich Firms With Crunchbase | boolean | false | Adds a per firm charge and run time |
| Output | options | Simplified | Simplified, Raw, or Selected Fields |

## Output

Each row carries `result_type`: `investor`, `firm`, `list`, or `error`.

| Field | Description |
|---|---|
| `name`, `position` | The investor and their role |
| `minInvestment`, `targetInvestment`, `maxInvestment` | Check size in USD |
| `firmName`, `firmUrl` | The firm and its profile |
| `personUrl`, `headshotUrl` | Investor profile and photo |
| `investmentLocations`, `listMemberships` | Geographies and other lists |
| `sourceListSlug`, `sourceListStage`, `sourceListVertical` | Which list the row came from |
| `slug`, `listUrl`, `investorCount`, `stage`, `vertical` | List catalog rows |
| `linkedinIndustry`, `linkedinSize`, `linkedinFollowers`, `linkedinUrl` | LinkedIn enrichment |
| `crunchbaseRank`, `crunchbaseEmployees`, `crunchbaseStatus`, `crunchbaseUrl` | Crunchbase enrichment |

Set **Output** to `Simplified` for a small agent friendly object, `Raw` for everything, or `Selected Fields` to pick your own. Simplified is forced when the node runs as an AI Agent tool.

## Example workflows

**1. Build a target investor list for a raise**

Manual Trigger → NFX Signal Investors (Mode: Investors, List Slugs: `saas-seed`, Maximum Items: 100) → Sort by `targetInvestment` → Google Sheets.

**2. Monthly watch on a sector**

Schedule Trigger (monthly) → NFX Signal Investors (Mode: Investors, List Slugs: `ai-seed`) → compare against the previous run to catch new entrants → Slack.

**3. Discover what you can pull**

Manual Trigger → NFX Signal Investors (Mode: Lists) → returns the catalog of public lists with slug, stage, sector, and investor count.

## Pricing

The Actor is pay per result on Apify, so you are billed for the rows returned plus a small per firm fee only when enrichment is switched on. See the [Actor page](https://apify.com/johnvc/nfx-signal-investor-api?fpr=9n7kx3) for current rates.

## Links

- Actor: https://apify.com/johnvc/nfx-signal-investor-api?fpr=9n7kx3
- Python and MCP examples: https://github.com/johnisanerd/Apify-NFX-Signal-Investor-API
- Apify n8n docs: https://docs.apify.com/platform/integrations/n8n
- n8n community nodes: https://docs.n8n.io/integrations/community-nodes/installation/

## License

MIT
Last Updated: 2026.09.07
