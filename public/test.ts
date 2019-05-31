import Monitor, { Request, Response } from '@fvaa/monitor';
import Router from '../src/index';
const startTime = Date.now();
const createServer = Monitor({ event: 'hashchange' });
const app = new Router({
  ignoreTrailingSlash: true,
  defaultRoute: (req: Request, res: Response) => {
    console.log('404', req, res);
  }
});
app.router('/test', (req: Request, res: Response) => {
  console.log('in router', req, res);
});

createServer(async (req: Request, res: Response) => {
  console.log('in app.lookup')
  app.lookup(req, res);
}).listen();
console.log(Date.now() - startTime);