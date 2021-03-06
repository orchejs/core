/**
 * @license
 * Copyright Mauricio Gemelli Vigolo.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/orchejs/rest/LICENSE
 */
import { ClassUtils } from '@orchejs/common';
import { InterceptorDecoratorOptions } from '../interfaces';
import { InterceptorLoader } from '../loaders';
import { HttpRequestMethod } from '../constants';

export function interceptor(
  path: string = '/*',
  options: InterceptorDecoratorOptions = { httpMethods: HttpRequestMethod.All }
) {
  return function(target: any) {
    const className = ClassUtils.getClassName(target);

    let httpMethodsArr: HttpRequestMethod[] = [];
    if (!Array.isArray(options.httpMethods)) {
      httpMethodsArr.push(options.httpMethods);
    } else {
      httpMethodsArr = options.httpMethods;
    }
    InterceptorLoader.addInterceptorConfig(path, options.order, className, httpMethodsArr);
  };
}

export function process() {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const instance = new target.constructor();
    InterceptorLoader.addInterceptorUnit(descriptor.value.bind(instance), propertyKey);
  };
}
