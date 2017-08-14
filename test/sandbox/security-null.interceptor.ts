import { Request, Response } from 'express';

import { interceptor, processing, requestParam, responseParam,
         HttpRequestMethod } from '../../';

@interceptor(null, null, 3)
class SecurityNullInterceptor {

  @processing()
  public preProcessing(@requestParam() req: Request): void {
    req.headers['Authorization'] = 'custom-token';
  }

}