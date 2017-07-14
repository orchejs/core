import { OrcheConfig } from './interfaces/orche-config';
import { OrcheResult } from './interfaces/orche-result';
import { DecoratorLoader } from './loaders/decorator.loader';
import { OrcheEngines } from './constants/orche-engines';
import { ExpressEngine } from './engines/express.engine';

export class Orche {

  init(config: OrcheConfig): Promise<OrcheResult> {
    let result: OrcheResult;

    return new Promise(async (resolve, reject) => {
      this.loadDecorators(reject);

      const engine = this.engineInitialization(config, reject);
      try {
        result = await engine.loadServer();
      } catch (error) {
        console.log('error');
        // TODO
        reject();
      }

      resolve(result);
    });
  }

  private loadDecorators(reject): Promise<any> {
    const decoratorLoader = new DecoratorLoader();

    return new Promise(async (resolve) => {
      let files: string [];
      try {
        files = await decoratorLoader.loadDecorators();
        console.log(files);
      } catch (error) {
        console.log('error', error);
        // TODO
        reject();
      }

      resolve(files)
    });
  }

  private engineInitialization(config: OrcheConfig, reject: any) {
    let engine;

    try {
      switch (config.apiEngine) {
        case OrcheEngines.ExpressJS:
          engine = new ExpressEngine(config);
          break;
        case OrcheEngines.Hapi:
          break;
        case OrcheEngines.Koa:
          break;
        case OrcheEngines.Restify:
          break;
        default:
          engine = new ExpressEngine(config);
          break;
      }
    } catch (error) {
      // TODO
      reject();
    }

    return engine;
  }

}
