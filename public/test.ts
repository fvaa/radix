import Monitor, { Request, Response } from '@fvaa/monitor';
import Router from '../src/index';
const createServer = Monitor({ event: 'hashchange' });
const app = new Router({
  ignoreTrailingSlash: true,
  async defaultRoute(req: Request, res: Response) {
    console.log('404', req, res);
  }
});
app.router('/test/:id', async (req: Request, res: Response, params: object) => {
  console.log('in router', req, res, params);
});

createServer(async (req: Request, res: Response) => await app.lookup(req, res)).listen();