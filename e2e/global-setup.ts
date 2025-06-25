import { server } from './helpers/mockServer';
export default async () => {
  await server.listen({ onUnhandledRequest: 'bypass' });
};
