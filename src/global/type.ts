export type ILoadingInput = { show: () => void; hide: () => void };

export type ILoading = {
  get: {
    show: () => void;
    hide: () => void;
  };
  set: (loadingInput: ILoadingInput) => void;
};
