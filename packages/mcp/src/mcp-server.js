/**
 * AAB MCP Server
 * 
 * Register with Model Context Protocol registry
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema } = require('@modelcontextprotocol/sdk/types.js');

// Import AAB SDK
const AABAgent = require('./index.js');

const server = new Server(
  { name: 'aab-yield', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

// Define tools
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  const aab = new AABAgent({ apiKey: args.apiKey });
  
  try {
    switch (name) {
      case 'get_yield_strategies':
        const strategies = await aab.getStrategies(args);
        return { content: [{ type: 'text', text: JSON.stringify(strategies, null, 2) }] };
      
      case 'get_exclusive_apy':
        const exclusive = await aab.getExclusive();
        return { content: [{ type: 'text', text: JSON.stringify(exclusive, null, 2) }] };
      
      case 'get_chain_rates':
        const rates = await aab.getRates(args.chain);
        return { content: [{ type: 'text', text: JSON.stringify(rates, null, 2) }] };
      
      case 'execute_strategy':
        const result = await aab.execute(args.strategyId, args);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      
      default:
        return { content: [{ type: 'text', text: 'Unknown tool' }] };
    }
  } catch (e) {
    return { content: [{ type: 'text', text: `Error: ${e.message}` }] };
  }
});

// Start server
const transport = new StdioServerTransport();
server.connect(transport);
