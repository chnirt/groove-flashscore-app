import { ILoading, ILoadingInput } from "./type";

export const Loading: ILoading = {
  get: {
    show: () => {},
    hide: () => {},
  },
  set: (loadingInput: ILoadingInput) => {
    Loading.get = loadingInput;
  },
};
