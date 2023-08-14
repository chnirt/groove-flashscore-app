export const env = import.meta.env;
export const eventNames = {
  SCREEN_VIEW: "screen_view",
  LOGIN: "login",
  REGISTER: "register",
};

export const IS_DEVELOP = !true && import.meta.env.DEV;
export const ORIGIN = window.location.origin;
