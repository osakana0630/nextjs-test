import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from ".";

const user = userEvent.setup();
// 表示テスト
test("[role='button']", () => {
  render(<Button>テスト</Button>);
  expect(screen.getByRole("button", { name: "テスト" })).toBeInTheDocument();
});

// テーマとバリアントのテスト
test("[data-theme='dark'] and [variant=small]", () => {
  render(
    <Button theme="dark" variant="small">
      テスト
    </Button>
  );
  expect(screen.getByRole("button", { name: "テスト" })).toHaveAttribute(
    "data-theme",
    "dark"
  );
  expect(screen.getByRole("button", { name: "テスト" })).toHaveAttribute(
    "data-variant",
    "small"
  );
});

// クリックイベントテスト
test("click event", async () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>テスト</Button>);
  await user.click(screen.getByRole("button", { name: "テスト" }));
  expect(handleClick).toHaveBeenCalled();
});

// disabled テスト
test("[role='button'][disabled='true']", () => {
  render(<Button disabled>テスト</Button>);
  expect(screen.getByRole("button", { name: "テスト" })).toBeDisabled();
});
