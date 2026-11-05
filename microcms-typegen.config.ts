import type { Config } from 'microcms-typegen';

export default {
  services: {
    main: {
      serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
      apiKey: process.env.MICROCMS_API_KEY,
      output: './src/microcms-types.ts',
      typeRules: {
        trustReadFieldConstraints: true,
      },
    },
  },
} satisfies Config;
