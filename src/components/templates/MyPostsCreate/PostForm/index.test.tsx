import { handleGetMyProfile } from "@/services/client/MyProfile/__mock__/msw";
import { mockUploadImage } from "@/services/client/UploadImage/__mock__/jest";
import { selectImageFile, setupMockServer } from "@/tests/jest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PostForm } from ".";

const user = userEvent.setup();

function setup() {
  const onClickSave = jest.fn()
  const onValid = jest.fn()
  const onInValid = jest.fn()
  render(
    <PostForm
      title="新規記事"
      onClickSave={onClickSave}
      onValid={onValid}
      onInvalid={onInValid}
    />
  )
  async function typeTitle(title: string) {
    const textbox = screen.getByRole("textbox", {name: "記事タイトル"})
    await user.type(textbox, title)
  }
  async function saveAsPublished() {
    await user.click(screen.getByRole("switch", {name: "公開ステータス"}))
    await user.click(screen.getByRole("button", {name: "記事を公開する"}))
    
  }
  async function saveAsDraft() {
    await user.click(screen.getByRole("button", {name: "下書き保存する"}))
  }
  
  return {
    typeTitle,
    saveAsDraft,
    saveAsPublished,
    onClickSave,
    onValid,
    onInValid
  }
}


test("不適正内容で下書き保存を試みると、バリデーションエラーが表示される", async () => {
  const {saveAsDraft} = setup()
  await saveAsDraft()
  
  // waitForはリトライ用に用意された関数
  await waitFor(() =>
    expect(
      screen.getByRole("textbox", {name: "記事タイトル"})
    ).toHaveErrorMessage("1文字以上入力してください")
  )
})

test("不適正内容で下書き保存を試みると、onInvalidイベントハンドラーが実行される", async () => {
  const {saveAsDraft, onClickSave, onValid, onInValid} = setup()
  await saveAsDraft()
  expect(onClickSave).toHaveBeenCalled()
  expect(onValid).not.toHaveBeenCalled()
  expect(onInValid).toHaveBeenCalled()
})

test("適正内容で下書き保存を試みると、onValidイベントハンドラーが実行される", async () => {
  mockUploadImage()
  const {typeTitle, saveAsDraft, onClickSave, onValid, onInValid} = setup()
  const {selectImage} = selectImageFile()
  await typeTitle("私の技術記事")
  await selectImage() // data-testId=fileのinput要素を取得して、画像を選択する
  await saveAsDraft()
  expect(onClickSave).toHaveBeenCalled()
  expect(onValid).toHaveBeenCalled()
  expect(onInValid).not.toHaveBeenCalled()
})