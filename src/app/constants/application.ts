export enum HTTP_STATUS_CODE {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400
}

export const REQUEST_CODE_TEMPLATE = `this.httpClient
    .{{METHOD}}<ResponseType<DataType>>('@host/{{PATH}}', {})
    .subscribe(ret => {});`;
