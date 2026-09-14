import type { Metadata } from "next";
import { format } from "date-fns";
import { serverFetch } from "@/lib/api";
import type { Contact } from "@/lib/types";
import { ContactActions } from "./contact-actions";
import { ExportCsvButton } from "./export-csv-button";

export const metadata: Metadata = { title: "Contacts" };

export default async function ContactsPage() {
  let contacts: Contact[] = [];
  try {
    contacts = await serverFetch<Contact[]>("/contacts");
  } catch {
    // unauthenticated or API unavailable
  }

  const newContacts = contacts.filter((c) => c.status === "new");
  const otherContacts = contacts.filter((c) => c.status !== "new");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Contacts
          {newContacts.length > 0 && (
            <span className="ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
              {newContacts.length} new
            </span>
          )}
        </h1>
        <ExportCsvButton contacts={contacts} />
      </div>

      {contacts.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] px-6 py-12 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">No inquiries yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {[...newContacts, ...otherContacts].map((contact) => (
            <details key={contact.id} className="rounded-xl border border-[var(--border)]">
              <summary className="flex cursor-pointer items-center justify-between px-4 py-3 hover:bg-[var(--muted)] transition-colors">
                <div className="min-w-0">
                  <span className="text-sm font-medium">{contact.name}</span>
                  <span className="ml-2 text-sm text-[var(--muted-foreground)]">&lt;{contact.email}&gt;</span>
                  {contact.subject ? (
                    <span className="ml-2 text-sm text-[var(--muted-foreground)] truncate">— {contact.subject}</span>
                  ) : null}
                </div>
                <div className="ml-4 flex shrink-0 items-center gap-3">
                  <span
                    className={`text-xs font-medium ${
                      contact.status === "new" ? "text-blue-600" : "text-[var(--muted-foreground)]"
                    }`}
                  >
                    {contact.status}
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {format(new Date(contact.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
              </summary>
              <div className="border-t border-[var(--border)] px-4 py-4">
                <p className="text-sm leading-6 whitespace-pre-wrap">{contact.message}</p>
                <div className="mt-4 flex gap-2">
                  <a
                    href={`mailto:${contact.email}`}
                    className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--muted)] transition-colors"
                  >
                    Reply via email
                  </a>
                  <ContactActions contactId={contact.id} status={contact.status} />
                </div>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
