import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import mockRouter from "next-router-mock";
import { OrderBy } from "./";

const user = userEvent.setup();

function setup(asPath = "/posts") {
  mockRouter.setCurrentUrl(asPath);
  render(<OrderBy />);
  const combobox = screen.getByRole("combobox");
  return { combobox };
}

test("初期表示、query.orderBy なしの場合「公開日時順」が選択されている", async () => {
  const { combobox } = setup();
  expect(combobox).toHaveDisplayValue("更新日時順");
});

test("選択した場合、query.orderBy が設定される", async () => {
  const { combobox } = setup();
  await user.selectOptions(combobox, "starCount");
  expect(combobox).toHaveDisplayValue("スター数順");
  expect(mockRouter).toMatchObject({
    pathname: "/posts",
    query: { orderBy: "starCount" },
  });
});

test("並び順を変更した際に、、1ページ目に遷移する", async () => {
  const { combobox } = setup("/posts?page=2&orderBy=updatedAt");
  // スター数順に変更
  await user.selectOptions(combobox, "starCount");
  // queryを確認して、1ページ目に遷移していることを検証
  expect(mockRouter).toMatchObject({
    pathname: "/posts",
    query: { page: 1, orderBy: "starCount" },
  });
});
