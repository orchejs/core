import { ParamDetails } from '../interfaces/param-details';
import { ParameterLoader } from '../loaders/parameter.loader';
import { ParamType } from '../constants/param-type';


export function requestParam() {
  return function (target: Object, propertyKey: string, parameterIndex: number) {
    ParameterLoader.addParameterConfig(target, propertyKey, undefined, parameterIndex,
                                       ParamType.RequestParam);
  };
}

export function responseParam() {
  return function (target: Object, propertyKey: string, parameterIndex: number) {
    ParameterLoader.addParameterConfig(target, propertyKey, undefined, parameterIndex,
                                       ParamType.ResponseParam);
  };
}

export function nextParam() {
  return function (target: Object, propertyKey: string, parameterIndex: number) {
    ParameterLoader.addParameterConfig(target, propertyKey, undefined, parameterIndex,
                                       ParamType.NextParam);
  };
}

export function queryParam(param: string | ParamDetails) {
  return function (target: Object, propertyKey: string, parameterIndex: number) {
    const paramDetails: ParamDetails = loadParam(param);
    ParameterLoader.addParameterConfig(target, propertyKey, paramDetails, parameterIndex,
                                       ParamType.QueryParam);
  };
}

export function pathParam(param: string | ParamDetails) {
  return function (target: Object, propertyKey: string, parameterIndex: number) {
    const paramDetails: ParamDetails = loadParam(param);
    ParameterLoader.addParameterConfig(target, propertyKey, paramDetails, parameterIndex,
                                       ParamType.PathParam);
  };
}

export function requestParamMapper() {
  return function (target: Object, propertyKey: string, parameterIndex: number) {
    ParameterLoader.addParameterConfig(target, propertyKey, undefined, parameterIndex,
                                       ParamType.RequestParamMapper);
  };
}

export function bodyParam(param: string | ParamDetails = { name: null }) {
  return function (target: Object, propertyKey: string, parameterIndex: number) {
    const paramDetails: ParamDetails = loadParam(param);
    ParameterLoader.addParameterConfig(target, propertyKey, paramDetails, parameterIndex,
                                       ParamType.BodyParam);
  };
}

export function headerParam(param: string | ParamDetails) {
  return function (target: Object, propertyKey: string, parameterIndex: number) {
    const paramDetails: ParamDetails = loadParam(param);
    ParameterLoader.addParameterConfig(target, propertyKey, paramDetails, parameterIndex,
                                       ParamType.HeaderParam);
  };
}

function loadParam(param?: string | ParamDetails): ParamDetails {
  let paramDetails: ParamDetails;
  if (typeof param === 'string') {
    paramDetails = {
      name: param
    };
  } else {
    paramDetails = param;
  }
  return paramDetails;
}
