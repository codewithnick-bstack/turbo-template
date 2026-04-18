export function FormBlock({ formId, submitLabel }: { formId: string; submitLabel?: string }) {
  return (
    <section className="px-6 py-16 md:py-20">
      <form
        data-form-id={formId}
        method="post"
        action={`/api/forms/${formId}/submit`}
        className="mx-auto max-w-xl space-y-4"
      >
        <input name="name" placeholder="Name" required className="w-full rounded border px-3 py-2" />
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full rounded border px-3 py-2"
        />
        <textarea
          name="message"
          placeholder="Message"
          required
          rows={4}
          className="w-full rounded border px-3 py-2"
        />
        <button
          type="submit"
          className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          {submitLabel ?? "Submit"}
        </button>
      </form>
    </section>
  );
}
