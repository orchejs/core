import { Request, Response } from 'express';

import { interceptor, processing, requestParam, responseParam,
         HttpRequestMethod } from '../../';

@interceptor('/orche/restricted', {
  httpMethods: HttpRequestMethod.Get,
  order: 1, 
})
class SecurityInterceptor {

  @processing()
  public processing(@requestParam() req: Request): void {
    req.headers['Authorization'] = 'custom-token';
  }

}
