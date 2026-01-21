import "./OrderProgressBar.css";

const STEPS = ["RECEBIDO", "PREPARANDO", "PRONTO", "ENTREGUE"];

// Ajuste fino: deve ser o mesmo valor do padding horizontal do .opb__track
const TRACK_PADDING_PX = 36;

export default function OrderProgressBar({ status }) {
  const isCanceled = status === "CANCELADO";

  const idx = STEPS.indexOf(status);
  const safeIndex = idx === -1 ? 0 : idx;

  const progressPercent =
    STEPS.length <= 1 ? 0 : (safeIndex / (STEPS.length - 1)) * 100;

  /**
   * Converte "posição percentual" para uma posição que respeita o padding do track.
   * Em vez de 0% e 100% baterem na borda, eles ficam dentro do padding.
   */
  const calcLeftStyle = (stepIndex) => {
    if (STEPS.length === 1) return { left: "50%" };

    // 0..1
    const t = stepIndex / (STEPS.length - 1);

    // left = padding + t * (100% - 2*padding)
    // Usamos calc() pra misturar px com %
    return {
      left: `calc(${TRACK_PADDING_PX}px + ${t} * (100% - ${
        TRACK_PADDING_PX * 2
      }px))`,
    };
  };

  return (
    <div className={`opb ${isCanceled ? "opb--canceled" : ""}`}>
      <div className="opb__top">
        <span className="opb__label">Status atual</span>
        <strong className="opb__status">{status || "RECEBIDO"}</strong>
      </div>

      <div className="opb__track">
        <div
          className="opb__fill"
          style={{ width: isCanceled ? "100%" : `${progressPercent}%` }}
        />

        {STEPS.map((step, i) => {
          const done = !isCanceled && i < safeIndex;
          const active = !isCanceled && i === safeIndex;

          return (
            <div
              key={step}
              className={[
                "opb__step",
                done ? "is-done" : "",
                active ? "is-active" : "",
                isCanceled ? "is-canceled" : "",
              ].join(" ")}
              style={calcLeftStyle(i)}
            >
              <div className="opb__dot" />
              <div className="opb__text">{step}</div>
            </div>
          );
        })}
      </div>

      {isCanceled && (
        <div className="opb__canceledText">
          Pedido cancelado. Se precisar, volte para a loja e faça um novo
          pedido.
        </div>
      )}
    </div>
  );
}
