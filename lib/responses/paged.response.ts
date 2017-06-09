import { GenericResponse } from '../responses/generic.response';
import { HttpResponseCode } from '../constants/http-response-code';
import { MimeType } from '../constants/mimetype';


export abstract class PagedResponse extends GenericResponse {

  protected size: number;
  protected page: number;
  protected totalElements: number;
  protected totalPages?: number;


  constructor(size: number, page: number, totalElements: number, contentType?: MimeType, 
              httpStatus?: HttpResponseCode) {
    super(contentType, httpStatus);

    this.size = size;
    this.page = page;
    this.totalElements = totalElements;

    if (totalElements > 0 && size > 0) {
      this.totalElements = totalElements;
      this.totalPages = Math.ceil(totalElements / size);
    }
  }

}
