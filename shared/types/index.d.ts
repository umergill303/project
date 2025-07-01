export type NoNull<T> = {
  [K in keyof T]: NonNullable<T[K]>;
}
