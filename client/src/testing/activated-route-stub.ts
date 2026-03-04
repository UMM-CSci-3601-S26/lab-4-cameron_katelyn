import { convertToParamMap, ParamMap, Params } from '@angular/router';
import { ReplaySubject } from 'rxjs';

export class ActivatedRouteStub {
  private subject = new ReplaySubject<ParamMap>(1);

  readonly paramMap = this.subject.asObservable();

  constructor(initialParams?: Params) {
    if (initialParams) {
      this.setParamMap(initialParams);
    }
  }

  setParamMap(params: Params) {
    this.subject.next(convertToParamMap(params));
  }
}
