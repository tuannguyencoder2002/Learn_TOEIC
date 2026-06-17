import type { ImportQuestionDisplay } from "@/lib/import-display";
import { highlightWord } from "@/lib/import-display";

interface ImportReviewCardProps {
  item: ImportQuestionDisplay;
}

export function ImportReviewCard({ item }: ImportReviewCardProps) {
  const { before, match, after } = highlightWord(item.sentenceComplete, item.correctWord);

  return (
    <article className="border-b border-border py-4 last:border-b-0 sm:py-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <p className="shrink-0 text-sm font-medium text-brand-muted sm:w-14">
          Câu {item.questionNumber}
        </p>

        <div className="min-w-0 flex-1 space-y-2 sm:space-y-3">
          <div className="border-l-2 border-border pl-3 sm:pl-4">
            <p className="break-words font-serif text-[15px] leading-relaxed text-brand sm:text-base">
              {match ?
                <>
                  {before}
                  <strong className="font-bold">{match}</strong>
                  {after}
                </>
              : item.sentenceComplete}
            </p>
          </div>

          {item.sentenceVi && (
            <p className="pl-0 text-sm leading-relaxed text-brand-muted sm:pl-4">
              <span className="font-medium text-brand">Dịch: </span>
              {item.sentenceVi}
            </p>
          )}

          <p className="break-words pl-0 font-serif text-sm italic leading-relaxed text-brand sm:pl-4">
            {item.grammarHintVi}
            <span className="ml-1 not-italic text-emerald-600">✓</span>
          </p>
        </div>
      </div>
    </article>
  );
}

interface ImportReviewListProps {
  items: ImportQuestionDisplay[];
  title?: string;
  summary?: string | null;
}

export function ImportReviewList({ items, title, summary }: ImportReviewListProps) {
  if (!items.length) return null;

  return (
    <section className="rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-6">
      {title && <h2 className="text-lg font-semibold text-brand">{title}</h2>}
      {summary && <p className="mt-1 text-sm text-brand-muted">{summary}</p>}
      <div className={title || summary ? "mt-4" : ""}>
        {items.map((item) => (
          <ImportReviewCard key={`${item.questionNumber}-${item.correctWord}`} item={item} />
        ))}
      </div>
    </section>
  );
}
