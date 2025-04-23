import axios from 'axios';

declare module 'axios' {
  export interface AxiosStatic {
    create(config?: object): AxiosInstance;
    CancelToken: {
      source(): {
        token: object;
        cancel: (message?: string) => void;
      };
    };
  }
}

// Add an empty export to make TypeScript treat this as a module
export {}; 