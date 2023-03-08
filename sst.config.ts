import { SSTConfig } from "sst";
import { Api } from "./stacks/Api"

export default {
  config(_input) {
    return {
      name: "graphql-error-repro",
      region: "us-west-1",
    };
  },
  stacks(app) {
    app.setDefaultFunctionProps({
      nodejs: {
        format: 'esm',
      },
    })
    app
      .stack(Api)
  }
} satisfies SSTConfig;
