import { mockUseToastAction } from "@/components/providers/ToastProvider/__mock__/hooks";
import {
  mockPostLogoutRejected,
  mockPostLogoutResolved,
} from "@/services/client/Logout/__mock__/jest";
import { getMyProfileData } from "@/services/client/MyProfile/__mock__/fixture";
import { mockWindowLocationReload } from "@/tests/jest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginUser } from "./";

const user = userEvent.setup();

const setup = () => {
  // location.reloadをmockして、テストに影響内容にしている
  mockWindowLocationReload();
  const { showToast } = mockUseToastAction();
  render(<LoginUser {...getMyProfileData} />);

  // ログアウトボタンをクリックするインタラクションを関数化
  const clickLogout = async () => {
    const region = screen.getByRole("region", { name: "ログインユーザー" });
    await user.hover(region);
    const button = screen.getByRole("button", { name: "ログアウト" });
    await user.click(button);
  };
  return { showToast, clickLogout };
};

test("ログアウトに成功すると、リロードされる", async () => {
  const mock = mockPostLogoutResolved();
  const { showToast, clickLogout } = setup();
  // ログアウトボタンをクリック
  await clickLogout();
  // postLogoutが呼ばれることを確認
  expect(mock).toHaveBeenCalled();
  // 「ログアウトに失敗しました」というトーストが表示されないことを確認
  expect(showToast).not.toHaveBeenCalled();
  // リロードされることを確認
  expect(window.location.reload).toHaveBeenCalled();
});

test("ログアウトに失敗すると、Toast が表示される", async () => {
  const mock = mockPostLogoutRejected();
  const { showToast, clickLogout } = setup();
  await clickLogout();
  expect(mock).toHaveBeenCalled();
  expect(showToast).toHaveBeenCalled();
  expect(window.location.reload).not.toHaveBeenCalled();
});
