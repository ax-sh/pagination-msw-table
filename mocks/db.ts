import { factory, primaryKey } from "@mswjs/data";
import { faker } from "@faker-js/faker";

import { rest } from "msw";

type User = {
  id: string;
  name: string;
};

const db = factory({
  post: {
    id: primaryKey(String),
    name: String,
  },
});

function createUserData(): User {
  return {
    id: faker.string.uuid(),
    name: faker.person.firstName(),
  };
}

[...new Array(500)].forEach((_) => db.post.create(createUserData()));

type SortBy = "name" | "length";
export const handlersa = [
  rest.get("/posts", (req, res, ctx) => {
    const page = (req.url.searchParams.get("page") || 1) as number;
    const per_page = (req.url.searchParams.get("per_page") || 10) as number;
    const sortBy = req.url.searchParams.get("per_page") as SortBy;
    console.log(sortBy, "text");
    const data = db.post.findMany({
      take: per_page,
      skip: Math.max(per_page * (page - 1), 0),
    });

    return res(
      ctx.delay(1500),
      ctx.json({
        rows: data,
        page,
        pageCount: Math.ceil(db.post.count() / per_page),
        total: db.post.count(),
      })
    );
  }),
  ...db.post.toHandlers("rest"),
] as const;
