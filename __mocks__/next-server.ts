export const NextResponse = {
  json: (body: any, init: any = {}) => {
    const status = init?.status || 200;
    return {
      status,
      json: async () => body,
    };
  },
};