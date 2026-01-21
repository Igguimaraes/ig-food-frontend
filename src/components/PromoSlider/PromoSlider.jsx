import "./PromoSlider.css";
import { useEffect, useMemo, useState } from "react";

export default function PromoSlider({
  items = [],
  autoPlay = true,
  intervalMs = 4500,
  onSelect,
}) {
  const safeItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);
  const [index, setIndex] = useState(0);

  const hasItems = safeItems.length > 0;

  const prev = () => {
    if (!hasItems) return;
    setIndex((i) => (i - 1 + safeItems.length) % safeItems.length);
  };

  const next = () => {
    if (!hasItems) return;
    setIndex((i) => (i + 1) % safeItems.length);
  };

  useEffect(() => {
    if (!autoPlay || !hasItems) return;
    const t = setInterval(next, intervalMs);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, intervalMs, hasItems]);

  // mantém índice válido se lista mudar
  useEffect(() => {
    if (!hasItems) return;
    if (index > safeItems.length - 1) setIndex(0);
  }, [hasItems, index, safeItems.length]);

  if (!hasItems) {
    return (
      <div className="ps ps--empty">
        <div className="ps__emptyTitle">Promoções</div>
        <div className="ps__emptySub">Nenhuma promoção cadastrada ainda.</div>
      </div>
    );
  }

  const current = safeItems[index];

  return (
    <div className="ps" aria-label="Promoções">
      <div className="ps__frame">
        <div
          className="ps__slide"
          onClick={() => onSelect?.(current)}
          role={onSelect ? "button" : undefined}
          tabIndex={onSelect ? 0 : undefined}
          onKeyDown={(e) => {
            if (!onSelect) return;
            if (e.key === "Enter" || e.key === " ") onSelect(current);
          }}
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.15), rgba(0,0,0,.55)), url(${current.image})`,
          }}
        >
          <div className="ps__content">
            <div className="ps__tag">{current.tag}</div>
            <h3 className="ps__title">{current.title}</h3>
            <p className="ps__desc">{current.description}</p>

            {current.ctaText ? (
              <div className="ps__ctaRow">
                <span className="ps__cta">{current.ctaText}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="ps__dots">
          {safeItems.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`ps__dot ${i === index ? "is-active" : ""}`}
              onClick={() => setIndex(i)}
              aria-label={`Ir para promoção ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
