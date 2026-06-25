export function Toast({ msg, type }: { msg: string; type: string }) {
  const cls = type === "error" ? "alert-error" : type === "info" ? "alert-info" : "alert-success";
  return <div className={`alert ${cls} shadow-lg`}><span>{msg}</span></div>;
}

export function ToastHost({ toasts }: { toasts: { id: number; msg: string; type: string }[] }) {
  return (
    <div className="toast toast-top toast-end z-[100]">
      {toasts.map((t) => <Toast key={t.id} msg={t.msg} type={t.type} />)}
    </div>
  );
}
