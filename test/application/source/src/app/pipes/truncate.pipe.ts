import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'limitTo'
})
export class TruncatePipe implements PipeTransform {

  transform(value: any, args: string) : string {
    let limit = args ? parseInt(args, 10) : 10;
    return value.slice(0,limit);
  }

}
