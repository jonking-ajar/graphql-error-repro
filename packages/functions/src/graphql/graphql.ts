import { GraphQLHandler } from "sst/node/graphql";
import gql from "graphql-tag";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { GraphQLError } from "graphql";
import {
  handlers,
  startServerAndCreateLambdaHandler,
} from "@as-integrations/aws-lambda";
import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import { ApolloServer } from "@apollo/server";

const typeDefs = gql`
  type Article {
    id: ID!
    title: String!
    url: String!
  }

  type Mutation {
    createArticle(title: String!, url: String!): Article!
  }

  type Query {
    article(articleID: String!): Article!
    articles: [Article!]!
  }
`;

interface Article {
  id: string;
  title: string;
  url: string;
}

const resolvers = {
  Query: {
    article: async (_: any, { articleID }: any): Promise<Article> => {
      return {
        id: articleID,
        title: "Article Title",
        url: "https://example.com",
      };
    },
  },
};

export const schema = buildSubgraphSchema([
  {
    typeDefs,
    resolvers,
  },
]);

export const server = new ApolloServer<GraphContext>({
  schema,
  introspection: true,
});

interface GraphContext {
  authToken: string;
  isTest: boolean;
}

export const handler = startServerAndCreateLambdaHandler<
  handlers.RequestHandler<
    APIGatewayProxyEventV2,
    APIGatewayProxyStructuredResultV2
  >,
  GraphContext
>(server, handlers.createAPIGatewayProxyEventV2RequestHandler(), {
  context: async ({ event }) => {
    const { headers } = event;
    if (!headers.authorization) {
      console.warn("Unauthorized");
      throw new GraphQLError("Unauthorized", {
        extensions: {
          code: "UNAUTHENTICATED",
        },
      });
    }
    return {
      authToken: headers.authorization ?? "",
      isTest: headers["test"] === "true" ? true : false,
    };
  },
});
