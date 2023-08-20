import "pinia";
import { ToastServiceMethods } from "primevue/toastservice";

declare module "pinia" {
  export interface PiniaCustomProperties {
    $message: ToastServiceMethods;
  }
}
