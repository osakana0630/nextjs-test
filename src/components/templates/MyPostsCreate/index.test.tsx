import * as MyPosts from "@/services/client/MyPosts/__mock__/msw";
import * as MyProfile from "@/services/client/MyProfile/__mock__/msw";
import { mockUploadImage } from "@/services/client/UploadImage/__mock__/jest";
import { selectImageFile, setupMockServer } from "@/tests/jest";
import { composeStories } from "@storybook/testing-react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import mockRouter from "next-router-mock";
import * as stories from "./index.stories";

const { Default } = composeStories(stories);
const user = userEvent.setup();

async function setup() {
  const { container } = render(<Default />);
  const { selectImage } = selectImageFile();
  async function typeTitle(title: string) {
    const textbox = screen.getByRole("textbox", { name: "記事タイトル" });
    await user.type(textbox, title);
  }
  async function saveAsPublished() {
    await user.click(screen.getByRole("switch", { name: "公開ステータス" }));
    await user.click(screen.getByRole("button", { name: "記事を公開する" }));
    await screen.findByRole("alertdialog");
  }
  async function saveAsDraft() {
    await user.click(screen.getByRole("button", { name: "下書き保存する" }));
  }
  async function clickButton(name: "はい" | "いいえ") {
    await user.click(screen.getByRole("button", { name }));
  }
  return {
    container,
    typeTitle,
    saveAsPublished,
    saveAsDraft,
    clickButton,
    selectImage,
  };
}

setupMockServer(...MyPosts.handlers, ...MyProfile.handlers);
beforeEach(() => {
  mockUploadImage();
  mockRouter.setCurrentUrl("/my/posts/create");
});

describe("AlertDialog", () => {
  test("[公開]を試みた際に、AlertDialogが表示される", async () => {
    const {typeTitle, selectImage, saveAsPublished} = await setup()
    // タイトルを入力
    await typeTitle("201")
    // 画像を選択
    await selectImage()
    // 公開ステータスを[公開]に変更し[記事を公開する]ボタンをクリック
    await saveAsPublished()
    // アラートダイアログが表示されていることを検証
    expect(screen.getByText("記事を公開します。よろしいですか？")).toBeInTheDocument()
  })
  test("[いいえ]を押下したらAlertDialogを閉じる", async () => {
    const {typeTitle, selectImage, saveAsPublished, clickButton} = await setup()
    // タイトルを入力
    await typeTitle("201")
    // 画像を選択
    await selectImage()
    // 公開ステータスを[公開]に変更し[記事を公開する]ボタンをクリック
    await saveAsPublished()
    // [いいえ]ボタンをクリック
    await clickButton("いいえ")
    // アラートダイアログが非表示であることを検証
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
  })
  test("不適切な内容で送信を試みると、AlertDialogが閉じる", async () => {
    const {selectImage, saveAsPublished, clickButton} = await setup()
    // 画像を選択
    await selectImage()
    // 公開ステータスを[公開]に変更し[記事を公開する]ボタンをクリック
    await saveAsPublished()
    // [はい]ボタンをクリック
    await clickButton("はい")
    // タイトルが不正であることを検証
    await waitFor(() =>
      expect(
        screen.getByRole("textbox", {name: "記事タイトル"})
      ).toBeInvalid()
    )
    // アラートダイアログが非表示であることを検証
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
  })
})

describe("Toast", () => {
  test("API 通信を開始した時「保存中…」が表示される", async () => {
    const { typeTitle, saveAsPublished, clickButton, selectImage } =
      await setup();
    await typeTitle("201");
    await selectImage();
    await saveAsPublished();
    await clickButton("はい");
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("保存中…")
    );
  });

  test("公開に成功した場合「公開に成功しました」が表示される", async () => {
    const { typeTitle, saveAsPublished, clickButton, selectImage } =
      await setup();
    await typeTitle("hoge");
    await selectImage();
    await saveAsPublished();
    await clickButton("はい");
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("公開に成功しました")
    );
  });

  test("公開に失敗した場合「公開に失敗しました」が表示される", async () => {
    const { typeTitle, saveAsPublished, clickButton, selectImage } =
      await setup();
    await typeTitle("500");
    await selectImage();
    await saveAsPublished();
    await clickButton("はい");
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("公開に失敗しました")
    );
  });
});

describe("画面遷移", () => {
  test("下書き保存した場合、下書きした記事ページに遷移する", async () => {
    const { typeTitle, saveAsDraft, selectImage } = await setup();
    await typeTitle("201");
    await selectImage();
    await saveAsDraft();
    await waitFor(() =>
      expect(mockRouter).toMatchObject({ pathname: "/my/posts/201" })
    );
  });

  test("公開に成功した場合、画面遷移する", async () => {
    const { typeTitle, saveAsPublished, clickButton, selectImage } = await setup();
    await typeTitle("201");
    await selectImage();
    await saveAsPublished();
    await clickButton("はい");
    await waitFor(() =>
      expect(mockRouter).toMatchObject({ pathname: "/my/posts/201" })
    );
  });
});
