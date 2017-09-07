import { validate } from '../../..';
import { NullValidator } from '@orche/validators';

export class Student {
  @validate({
    validator: NullValidator
  })
  private _name: string;

  constructor(name?: string) {
    this.name = name;
  }

  get name(): string {
    return this.name;
  }
  set name(name: string) {
    this.name = name;
  }
}