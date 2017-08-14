import { Request, Response } from 'express';

import { interceptor, processing, requestParam, responseParam,
         HttpRequestMethod } from '../../';

@interceptor(
  ['/orche/restricted'], 
  [HttpRequestMethod.Get, HttpRequestMethod.Delete, HttpRequestMethod.Head, 
    HttpRequestMethod.Options, HttpRequestMethod.Patch, HttpRequestMethod.Post, 
    HttpRequestMethod.Put], 
  0)
class SecurityArrayInterceptor {

  @processing()
  public processing(@requestParam() req: Request, @responseParam() res: Response): void {
    req.headers['Authorization'] = 'custom-token';
  }
  
}
