import { handleGetMyProfile } from "@/services/client/MyProfile/__mock__/msw";
import { setupMockServer } from "@/tests/jest";
import { composeStories } from "@storybook/testing-react";
import { render, screen, waitFor } from "@testing-library/react";
import * as stories from "./index.stories";

const { NotLoggedIn, LoggedIn } = composeStories(stories);
const server = setupMockServer();

describe("未ログインの場合", () => {
  test("[role=banner]", async () => {
    server.use(handleGetMyProfile({ status: 401 }));
    render(<NotLoggedIn />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  test("ログインボタンが表示されていること", async () => {
    server.use(handleGetMyProfile({ status: 401 }));
    render(<NotLoggedIn />);
    expect(
      screen.getByRole("heading", { name: "Tech Posts" })
    ).toBeInTheDocument();
    const loginButton = screen.getByRole("link", { name: "ログイン" });
    expect(loginButton).toBeInTheDocument();

    // LinkButtonに渡されるhref propが"/login"であることを確認
    expect(loginButton).toHaveAttribute("href", "/login");
  });
});

describe("ログイン時の場合", () => {
  test("ログインリンクが表示されていないこと", async () => {
    server.use(handleGetMyProfile());
    render(<LoggedIn />);
    await waitFor(() =>
      expect(
        screen.queryByRole("link", { name: "ログイン" })
      ).not.toBeInTheDocument()
    );
  });
  test("リンクが表示されていること", async () => {
    server.use(handleGetMyProfile());
    render(<LoggedIn />);
    await waitFor(() => {
      expect(
        screen.getByRole("link", { name: "My Posts" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "Create Post" })
      ).toBeInTheDocument();
    });
  });
});
