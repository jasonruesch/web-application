import { graphqlHandlers } from './graphql-handlers';
import { restHandlers } from './rest-handlers';

// One handler set, two transports, one shared in-memory DB.
export const handlers = [...restHandlers, ...graphqlHandlers];
