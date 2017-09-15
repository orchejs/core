import { UrlUtils } from '../utils/url.utils';
import { Request } from 'restify';
import { RequestMapper } from './request-mapper';

export class RestifyRequestMapper extends RequestMapper {
  constructor(request: Request) {
    super(request);
  }

  protected loadPathParams(request: Request): void {
    const params = request.params;

    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        this.pathParams[key] = params[key];
      }
    }
  }

  protected loadQueryParams(request: Request): void {
    const params = request.query;

    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        const paramValue: any = params[key];
        this[key] = UrlUtils.getPathValue(paramValue);
      }
    }
  }
}
