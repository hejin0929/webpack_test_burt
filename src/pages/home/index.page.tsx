import test from "@my/assets/test.jpg";
import * as Api from "@src/api/index";
import { FC } from "react";
import StyleCss from "./index.module.scss";

const HomePage: FC = () => {
  console.log(Api);
  return (
    <div className={StyleCss.home}>
      初次见面111122222
      <img src={test} />
    </div>
  );
};

export default HomePage;
