"use client";

import type { ReactNode } from "react";
import ArticleNoticeModal from "./article-notice-modal";
import { useArticleNoticeStore } from "@/stores/article-notice-store";

export default function ArticleNoticeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { article, isOpen, isNew, closeNotice } = useArticleNoticeStore();

  return (
    <>
      {children}
      <ArticleNoticeModal
        article={article}
        isOpen={isOpen}
        onClose={closeNotice}
        isNew={isNew}
      />
    </>
  );
}
