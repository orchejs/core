import { NextFunction } from 'express';
import { headerParam, HttpRequestMethod, interceptor, 
         nextParam, processing, requestParam } from '../..';

@interceptor('/')
class SecurityAllInterceptor {

  @processing()
  intercept(@nextParam() next: NextFunction): void {
    next();
  }

}
