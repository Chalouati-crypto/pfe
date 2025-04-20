// Create a global store to manage the notice state
import { create } from "zustand";

type ArticleNoticeStore = {
  article: any | null;
  isOpen: boolean;
  isNew: boolean;
  openNotice: (article: any, isNew: boolean) => void;
  closeNotice: () => void;
};

export const useArticleNoticeStore = create<ArticleNoticeStore>((set) => ({
  article: null,
  isOpen: false,
  isNew: true,
  openNotice: (article, isNew) => set({ article, isOpen: true, isNew }),
  closeNotice: () => set({ isOpen: false }),
}));
