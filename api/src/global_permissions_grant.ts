import { FastifyInstance } from "fastify";
import Joi = require("joi");
import { VError } from "verror";

import Intent, { globalIntents } from "./authz/intents";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { AuthenticatedRequest } from "./httpd/lib";
import { Ctx } from "./lib/ctx";
import * as Result from "./result";
import { Identity } from "./service/domain/organization/identity";
import { ServiceUser } from "./service/domain/organization/service_user";

interface RequestBodyV1 {
  apiVersion: "1.0";
  data: {
    identity: Identity;
    intent: Intent;
  };
}

const requestBodyV1Schema = Joi.object({
  apiVersion: Joi.valid("1.0").required(),
  data: Joi.object({
    identity: Joi.string().required(),
    intent: Joi.valid(globalIntents).required(),
  }),
});

type RequestBody = RequestBodyV1;
const requestBodySchema = Joi.alternatives([requestBodyV1Schema]);

function validateRequestBody(body: any): Result.Type<RequestBody> {
  const { error, value } = Joi.validate(body, requestBodySchema);
  return !error ? value : error;
}

function mkSwaggerSchema(server: FastifyInstance) {
  return {
    beforeHandler: [(server as any).authenticate],
    description:
      "Grant the right to execute a specific intent on the Global scope to a given user.",
    tags: ["global"],
    summary: "Grant a permission to a group or user",
    security: [
      {
        bearerToken: [],
      },
    ],
    body: {
      type: "object",
      required: ["apiVersion", "data"],
      properties: {
        apiVersion: { type: "string", example: "1.0" },
        data: {
          type: "object",
          required: ["identity", "intent"],
          properties: {
            identity: { type: "string", example: "aSmith" },
            intent: { type: "string", enum: globalIntents, example: "global.createProject" },
          },
        },
      },
    },
    response: {
      200: {
        description: "successful response",
        type: "object",
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: { type: "string", example: "OK" },
        },
      },
      401: NotAuthenticated.schema,
    },
  };
}

interface Service {
  grantGlobalPermission(
    ctx: Ctx,
    user: ServiceUser,
    grantee: Identity,
    permission: Intent,
  ): Promise<void>;
}

export function addHttpHandler(server: FastifyInstance, urlPrefix: string, service: Service) {
  server.post(`${urlPrefix}/global.grantPermission`, mkSwaggerSchema(server), (request, reply) => {
    const ctx: Ctx = { requestId: request.id, source: "http" };

    const user: ServiceUser = {
      id: (request as AuthenticatedRequest).user.userId,
      groups: (request as AuthenticatedRequest).user.groups,
    };

    const bodyResult = validateRequestBody(request.body);

    if (Result.isErr(bodyResult)) {
      const { code, body } = toHttpError(
        new VError(bodyResult, "failed to grant global permission"),
      );
      reply.status(code).send(body);
      return;
    }

    const { identity: grantee, intent } = bodyResult.data;

    service
      .grantGlobalPermission(ctx, user, grantee, intent)
      .then(() => {
        const code = 200;
        const body = {
          apiVersion: "1.0",
          data: "OK",
        };
        reply.status(code).send(body);
      })
      .catch(err => {
        const { code, body } = toHttpError(err);
        reply.status(code).send(body);
      });
  });
}
