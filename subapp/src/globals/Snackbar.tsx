import { observable } from "mobx";

class Snackbar {
  @observable instance: Snackbar;

  show = (message: string, isError: boolean, duration: number) => {
    this.instance.show(message, isError, duration);
  };

  showError = (message: string, duration?: number) => {
    this.instance.show(message, true, duration);
  };

  showMessage = (message: string, duration: number) => {
    this.instance.show(message, false, duration);
  };

  hide = () => {
    this.instance.hide();
  };
}

const snackbar = new Snackbar();
export default snackbar;
