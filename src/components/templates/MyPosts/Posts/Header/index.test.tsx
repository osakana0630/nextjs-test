import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import mockRouter from "next-router-mock";
import { Header } from "./";

const user = userEvent.setup();

// テストのarrangeをsetup関数として切り出すことで、簡潔にテストを記述できる
function setup(url = "/my/posts?page=1") {
  mockRouter.setCurrentUrl(url);
  render(<Header />);
  const combobox = screen.getByRole("combobox", { name: "公開ステータス" });

  // インタラクションテストのため、selectOption関数を返す
  function selectOption(label: string) {
    return user.selectOptions(combobox, label);
  }

  return { combobox, selectOption };
}

// URLパラメータなし(デフォルト): すべて
// URLパラメータ status=public: 公開
// URLパラメータ status=private: 下書き

// 表示テスト
test("デフォルトで[すべて]が選択されている", async () => {
  const { combobox } = setup();
  expect(combobox).toHaveDisplayValue("すべて");
});

test("?status=publicの場合、[公開]が選択されている", async () => {
  const { combobox } = setup("/my/posts?status=public");
  expect(combobox).toHaveDisplayValue("公開");
});

test("?status=privateの場合、[下書き]が選択されている", async () => {
  const { combobox } = setup("/my/posts?status=private");
  expect(combobox).toHaveDisplayValue("下書き");
});

// インタラクションテスト
test("公開ステータスを変更すると、statusが変わる", async () => {
  const { selectOption } = setup();
  // 初期URLの検証
  expect(mockRouter).toMatchObject({ query: { page: "1" } });
  // 公開選択
  await selectOption("公開");
  expect(mockRouter).toMatchObject({ query: { page: "1", status: "public" } });
  // 下書き選択
  await selectOption("下書き");
  expect(mockRouter).toMatchObject({ query: { page: "1", status: "private" } });
});

test("公開ステータスを変更すると、1ページ目に遷移する", async () => {
  const { selectOption } = setup("/my/posts?page=2&status=all");
  // 初期URLの検証
  expect(mockRouter).toMatchObject({ query: { page: "2" } });
  // 公開選択し、公開ステータスを変更
  await selectOption("公開");
  // 1ページ目に遷移することを検証
  expect(mockRouter).toMatchObject({ query: { page: "1" } });
});
