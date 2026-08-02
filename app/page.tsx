import type { Metadata } from "next";
import Home from "../src/views/Home";

export const metadata: Metadata = {
  title: "Font Lab — 本机字体实验场",
  description: "在浏览器中快速搜索、比较并预览本机字体。",
};

export default function Page() {
  return <Home />;
}
