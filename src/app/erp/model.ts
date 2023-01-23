import { HttpClient } from '@angular/common/http';
import { eachLimit } from 'async-es';

import { Subject, ReplaySubject, from, throwError } from 'rxjs';
import { map, catchError, retry } from 'rxjs/operators';
import { checkIfValidMongoID } from '../core/utils';
// import { getData, hasDownloadedData, isOnline } from './offline-utils';

export interface IndexInterface {
  indexName: string;
  keyPath: string | string[];
  objectParameters?: any;
}

const defaultOpts: any = {
  displayAutocompleteField: 'title',
};

export class Model {
  data: any;
  onData: Subject<any> = new ReplaySubject(1);
  normType: string;
  index!: IndexInterface[];
  constructor(
    public http: HttpClient,
    public host: string,
    public type: string,
    public opts: any = {}
  ) {
    this.normType = type.replace(/\//g, '-');

    for (const key in defaultOpts) {
      this.opts[key] ??= defaultOpts[key];
    }
  }

  displayAutocomplete(val: string) {
    if (checkIfValidMongoID(val)) {
      const item = this.data.find((item: any) => item._id === val);
      if (item) {
        return item[this.opts.displayAutocompleteField];
      }
    }
    return '';
  }

  fetch(requestConfig?: any) {
    return this.http.get(`${this.host}${this.type}`, requestConfig).pipe(
      map((res: any) => {
        this.data = res;
        this.onData.next(res);
        return res;
      })
    );
  }

  getById(id: string, config?: any) {
    return this.http.get(`${this.host}${this.type}/${id}`, config);
  }

  findById(id: string) {
    const item = this.data.find((item: any) => item._id === id);
    return item ? { ...item } : null;
  }

  update(id: string, data: any, opts?: any) {
    return this.http.put(`${this.host}${this.type}/${id}`, data, opts);
  }

  create(data: any, opts?: any) {
    return this.http.post(`${this.host}${this.type}`, data, opts);
  }

  delete(id: string, opts?: any) {
    return this.http.delete(`${this.host}${this.type}/${id}`, opts);
  }

  bulkUpdate(list: any[], limit = 10): Promise<any> {
    return new Promise((resolve) => {
      eachLimit(
        list,
        limit,
        (item: any, cb: any) => {
          this.update(item._id, item)
            .pipe(retry(5))
            .subscribe(() => {
              cb();
            });
        },
        () => {
          resolve(null);
        }
      );
    });
  }
}
