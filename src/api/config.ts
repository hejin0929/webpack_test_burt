import { Paths } from "./index";

type UrlTest<T extends keyof Paths> = T extends keyof Paths
  ? Paths[T]
  : undefined;

type Test = UrlTest<"/api/user_mobile/{name}">;

type Test2 = UrlTest<"/api/user_mobile/{name}">;

// const data: Test2 = {
//   type: "get",
//   // Params: {},
// };

console.log();
