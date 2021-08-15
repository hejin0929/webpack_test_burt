import { makeAutoObservable } from "mobx";

export class HomeStore {
  name: boolean | undefined;

  constructor() {
    this.name = Boolean(true);
    makeAutoObservable(this);
  }
}
