import * as express from 'express';
import * as cors from 'cors';
import * as moment from 'moment';

import { Router } from './router';
import { HttpRequestMethod } from '../constants/http-request-method';
import { HttpResponseCode } from '../constants/http-response-code';
import { MimeType } from '../constants/mimetype';
import { ParamType } from '../constants/param-type';
import { ContentType } from '../interfaces/content-type';
import { CorsConfig } from '../interfaces/cors-config';
import { LoadRouterStats } from '../interfaces/load-router-stats';
import { ParamConfig } from '../interfaces/param-config';
import { RouterConfig } from '../interfaces/router-config';
import { RouterUnit } from '../interfaces/router-unit';
import { RouterLoader } from '../loaders/router.loader';
import { ParameterLoader } from '../loaders/parameter.loader';
import { ErrorResponse } from '../responses/error.response';
import { ExpressRequestMapper } from '../requests/express.requestmapper';
import { PathUtils } from '../utils/path.utils';

export class ExpressRouter extends Router {

  constructor(app: express.Application) {
    super(app);
  }

  public loadRoutes(path: string): Promise<LoadRouterStats> {
    const routerStats: LoadRouterStats = {
      loadedRoutes: [],
      initializationTime: 0,
    };

    return new Promise((resolve, reject) => {
      const initTime = moment();
      if (!RouterLoader.routerConfigs || RouterLoader.routerConfigs.length === 0) {
        resolve(routerStats);
        // TODO add log here
        // msg 'There is no express route to configure!'
        return;
      }

      for (let index = 0; index < RouterLoader.routerConfigs.length; index += 1) {
        let loaded: boolean = true;

        const routerConfig: RouterConfig = RouterLoader.routerConfigs[index];
        const routerConfigPath = PathUtils.urlSanitation(routerConfig.path);
        const router: express.Router = express.Router();
        const routerUnits: RouterUnit[] = routerConfig.routerUnits;

        routerUnits.forEach((routerUnit) => {
          const method: any = this.routeProcessor(routerConfig.className, routerUnit.method,
                                                  routerUnit.methodName, routerUnit.contentType);
          
          const unitPath: string = PathUtils.urlSanitation(routerUnit.path);

          const corsConfig: CorsConfig = routerUnit.cors || {};
          if (corsConfig.preflight) {
            router.options(unitPath, cors(corsConfig.corsOptions));
          }

          switch (routerUnit.httpMethod) {
            case HttpRequestMethod.Get:
              if (corsConfig.corsOptions) {
                router.get(unitPath, cors(corsConfig.corsOptions), method);
              } else {
                router.get(unitPath, method);
              }
              break;
            case HttpRequestMethod.Post:
              if (corsConfig.corsOptions) {
                router.post(unitPath, cors(corsConfig.corsOptions), method);
              } else {
                router.post(unitPath, method);
              }
              break;
            case HttpRequestMethod.Put:
              if (corsConfig.corsOptions) {
                router.put(unitPath, cors(corsConfig.corsOptions), method);
              } else {
                router.put(unitPath, method);
              }
              break;
            case HttpRequestMethod.Head:
              if (corsConfig.corsOptions) {
                router.head(unitPath, cors(corsConfig.corsOptions), method);
              } else {
                router.head(unitPath, method);
              }
              break;
            case HttpRequestMethod.Delete:
              if (corsConfig.corsOptions) {
                router.delete(unitPath, cors(corsConfig.corsOptions), method);
              } else {
                router.delete(unitPath, method);
              }
              break;
            case HttpRequestMethod.All:
              if (corsConfig.corsOptions) {
                router.all(unitPath, cors(corsConfig.corsOptions), method);
              } else {
                router.all(unitPath, method);
              }
              break;
            case HttpRequestMethod.Patch:
              if (corsConfig.corsOptions) {
                router.patch(unitPath, cors(corsConfig.corsOptions), method);
              } else {
                router.patch(unitPath, method);
              }
              break;
            case HttpRequestMethod.Options:
              router.options(unitPath, method);
              break;
            default:
              loaded = false;
              break;
          }
        });

        const resourcePath = path + routerConfigPath;
        this.app.use(resourcePath, router);

        if (loaded) {
          routerStats.loadedRoutes.push(routerConfig);
        }
      }

      routerStats.initializationTime = initTime.diff(moment(), 'seconds');
      resolve(routerStats);
    });
  }

  protected routeProcessor(target: string, method: Function, methodName: string, 
                           contentType: ContentType): Function {
    return function () {
      const req: express.Request = arguments[0];
      const res: express.Response = arguments[1];
      const next: express.NextFunction = arguments[2];

      let endpointArgs: any = [];
      
      const paramConfig: ParamConfig = ParameterLoader.getParameterConfig(target, methodName);
      if (paramConfig && paramConfig.params && paramConfig.params.length > 0) {
        paramConfig.params.forEach((param, index) => {
          switch (param.type) {
            case ParamType.RequestParam:
              endpointArgs[param.parameterIndex] = req;
              break;
            case ParamType.ResponseParam:
              endpointArgs[param.parameterIndex] = res;
              break;
            case ParamType.NextParam:
              endpointArgs[param.parameterIndex] = next;
              break;
            case ParamType.PathParam:
              endpointArgs[param.parameterIndex] = req.params[param.paramName];
              break;
            case ParamType.QueryParam:
              endpointArgs[param.parameterIndex] = req.query[param.paramName];
              break;
            case ParamType.RequestParamMapper:
              const requestMapper: ExpressRequestMapper = new ExpressRequestMapper(req);
              endpointArgs[param.parameterIndex] = requestMapper;
              break;
            case ParamType.BodyParam:
              endpointArgs[param.parameterIndex] = req.body;
              break;
            case ParamType.HeaderParam:
              endpointArgs[param.parameterIndex] = req.headers[param.paramName];
              break;
          }
        });
      } else {
        endpointArgs = arguments;
      }

      let result: any;
      try {
        result = method.apply(this, endpointArgs);
        
        if (result && result.isResponseType) {
          res.contentType(contentType.response['value']);
          res.status(result.getHttpStatus()).send(result.toObjectLiteral());
        } else if (result) {
          res.contentType(contentType.response['value']);
          res.status(HttpResponseCode.Ok).send(result);
        } else {
          next();
        }

      } catch (e) {
        result = new ErrorResponse(e.message, null, HttpResponseCode.InternalServerError);
        res.contentType(MimeType.json.toString());
        res.status(result.getHttpStatus()).send(result.toObjectLiteral());
      }
    };
  }
}
